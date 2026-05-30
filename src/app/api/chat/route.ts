import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateResponse, ChatMessage } from "@/lib/openai";

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const conversations = await prisma.conversation.findMany({
    where: { source: "chat" },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(conversations);
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { message, conversationId } = await request.json();

  const config = await prisma.agentConfig.findFirst();
  if (!config) {
    return NextResponse.json({ error: "Configuração não encontrada" }, { status: 500 });
  }

  let conversation;
  if (conversationId) {
    conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  }
  if (!conversation) {
    conversation = await prisma.conversation.create({ data: { source: "chat" } });
  }

  await prisma.message.create({
    data: { conversationId: conversation.id, role: "user", content: message },
  });

  const history = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    take: config.historyLimit,
  });

  const messages: ChatMessage[] = history.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));

  const { content, tokens } = await generateResponse(
    messages,
    config.systemPrompt,
    config.temperature,
    config.maxTokens,
    {
      aiProvider: config.aiProvider,
      openaiApiKey: config.openaiApiKey,
      openaiModel: config.openaiModel,
      groqApiKey: config.groqApiKey,
      groqModel: config.groqModel,
    }
  );

  const assistantMessage = await prisma.message.create({
    data: { conversationId: conversation.id, role: "assistant", content, tokens },
  });

  return NextResponse.json({
    conversationId: conversation.id,
    message: {
      id: assistantMessage.id,
      content: assistantMessage.content,
      tokens: assistantMessage.tokens,
      role: assistantMessage.role,
    },
  });
}
