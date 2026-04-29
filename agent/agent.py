from pathlib import Path
from typing import AsyncGenerator
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from rag.engine import RAGEngine
from memory.store import get_history, save_message, get_memories, save_memory
from config import settings


class Agent:
    def __init__(self):
        self.rag = RAGEngine()
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            streaming=True,
        )

    async def chat(self, session_id: str, message: str) -> AsyncGenerator[str, None]:
        save_message(session_id, "user", message)

        context = self.rag.search(message)
        history = get_history(session_id, limit=10)
        memories = get_memories(session_id)

        system_prompt = SystemMessage(
            content=(
                "You are a helpful AI assistant integrated into a personal website. "
                "You have access to the user's personal knowledge base. "
                "Be concise, technical, and occasionally inject some hacker/terminal flair. "
                "Use markdown formatting when appropriate.\n\n"
                f"Context from knowledge base:\n{chr(10).join(context) if context else 'No relevant context found.'}\n\n"
                f"User memories:\n{memories}"
            )
        )

        messages = [system_prompt]
        for h in history[-10:]:
            messages.append(
                HumanMessage(content=h["content"]) if h["role"] == "user"
                else SystemMessage(content=h["content"])
            )
        messages.append(HumanMessage(content=message))

        full_response = ""
        async for chunk in self.llm.astream(messages):
            content = chunk.content or ""
            full_response += content
            yield content

        save_message(session_id, "assistant", full_response)

        if "remember" in message.lower() or "my name" in message.lower():
            words = message.lower().split()
            if "name is" in message.lower():
                idx = words.index("is") + 1
                if idx < len(words):
                    save_memory(session_id, "name", words[idx])
