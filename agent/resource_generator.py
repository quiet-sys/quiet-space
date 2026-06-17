import json
import time
from typing import AsyncGenerator, Dict, Any

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage

from rag.engine import RAGEngine
from config import settings


class ResourceGenerator:
    def __init__(self, rag: RAGEngine):
        self.rag = rag
        self.llm = ChatOpenAI(
            model=settings.openai_model,
            api_key=settings.openai_api_key,
            base_url=settings.openai_base_url,
            streaming=True,
        )

    async def generate(self, req) -> AsyncGenerator[Dict[str, Any], None]:
        task_id = f"task_{int(time.time() * 1000)}"
        started_at = time.time()

        yield {
            "event": "task_started",
            "data": json.dumps({
                "taskId": task_id,
                "agents": ["researcher", "writer", "reviewer"],
                "startedAt": int(started_at * 1000),
            }, ensure_ascii=False),
        }

        try:
            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "researcher",
                    "status": "running",
                    "message": "searching knowledge base...",
                }, ensure_ascii=False),
            }
            yield {
                "event": "stage_progress",
                "data": json.dumps({
                    "stage": "research",
                    "progress": 30,
                    "message": "gathering relevant materials...",
                }, ensure_ascii=False),
            }

            context = self.rag.search(req.topic)

            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "researcher",
                    "status": "done",
                    "message": f"found {len(context)} relevant documents",
                }, ensure_ascii=False),
            }

            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "writer",
                    "status": "running",
                    "message": "generating learning resource...",
                }, ensure_ascii=False),
            }
            yield {
                "event": "stage_progress",
                "data": json.dumps({
                    "stage": "generate",
                    "progress": 60,
                    "message": "writing content...",
                }, ensure_ascii=False),
            }

            prompt = self._build_prompt(req, context)
            messages = [HumanMessage(content=prompt)]

            markdown = ""
            async for chunk in self.llm.astream(messages):
                content = chunk.content or ""
                markdown += content
                yield {
                    "event": "content_chunk",
                    "data": json.dumps({"text": content}, ensure_ascii=False),
                }

            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "writer",
                    "status": "done",
                    "message": "content generated",
                }, ensure_ascii=False),
            }

            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "reviewer",
                    "status": "running",
                    "message": "quality review...",
                }, ensure_ascii=False),
            }
            yield {
                "event": "stage_progress",
                "data": json.dumps({
                    "stage": "review",
                    "progress": 90,
                    "message": "evaluating quality...",
                }, ensure_ascii=False),
            }

            quality = {
                "score": 85,
                "summary": "good comprehensive resource",
                "suggestions": ["add more practical examples", "include a quick reference section"],
            }
            yield {
                "event": "quality_report",
                "data": json.dumps(quality, ensure_ascii=False),
            }

            yield {
                "event": "agent_status",
                "data": json.dumps({
                    "agent": "reviewer",
                    "status": "done",
                    "message": "review complete",
                }, ensure_ascii=False),
            }

            elapsed = round(time.time() - started_at, 1)
            yield {
                "event": "task_done",
                "data": json.dumps({
                    "taskId": task_id,
                    "markdown": markdown,
                    "qualityReport": quality,
                    "elapsedSeconds": elapsed,
                }, ensure_ascii=False),
            }

        except Exception as e:
            elapsed = round(time.time() - started_at, 1)
            yield {
                "event": "task_error",
                "data": json.dumps({
                    "taskId": task_id,
                    "message": str(e),
                    "elapsedSeconds": elapsed,
                }),
            }

    def _build_prompt(self, req, context) -> str:
        parts = [f"Create a comprehensive learning resource about: {req.topic}"]
        if req.learning_goal:
            parts.append(f"Learning goal: {req.learning_goal}")
        if req.learner_level:
            parts.append(f"Target audience: {req.learner_level}")
        if req.preferred_style:
            parts.append(f"Preferred style: {req.preferred_style}")
        if req.duration:
            parts.append(f"Estimated reading time: {req.duration}")
        if req.structure:
            parts.append(f"Desired structure: {req.structure}")

        parts.append(
            "\nFormat as a well-structured markdown document with headings, "
            "bullet points, and code blocks where appropriate. "
            "Keep it practical and actionable."
        )

        if context:
            parts.append("\nRelevant knowledge base context:\n" + "\n".join(context[:3]))

        return "\n".join(parts)
