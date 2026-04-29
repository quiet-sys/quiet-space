from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    openai_api_key: str = ""
    openai_base_url: str = "https://api.deepseek.com/v1"
    openai_model: str = "deepseek-chat"

    models_dir: str = "./models"
    chroma_persist_dir: str = "./data/chroma"
    knowledge_dir: str = "./knowledge"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
Path(settings.chroma_persist_dir).parent.mkdir(parents=True, exist_ok=True)
Path(settings.models_dir).mkdir(parents=True, exist_ok=True)
