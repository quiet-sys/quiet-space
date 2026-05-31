from pathlib import Path
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from config import settings

DEFAULT_MODEL = "BAAI/bge-small-zh-v1.5"


class RAGEngine:
    def __init__(self, model_name: str = DEFAULT_MODEL):
        model_path = Path(settings.models_dir) / f"models--{model_name.replace('/', '--')}"
        snapshot_dir = model_path / "snapshots"
        local_snapshots = sorted(snapshot_dir.iterdir()) if snapshot_dir.exists() else []
        resolved_model = str(local_snapshots[-1]) if local_snapshots else model_name
        self.embeddings = HuggingFaceEmbeddings(
            model_name=resolved_model,
            model_kwargs={"device": "cpu"},
            cache_folder=str(Path(settings.models_dir)),
        )
        self.vector_store = Chroma(
            collection_name="knowledge",
            embedding_function=self.embeddings,
            persist_directory=settings.chroma_persist_dir,
        )
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=100,
        )

    def ingest(self, file_path: str | None = None):
        path = Path(file_path) if file_path else Path(settings.knowledge_dir)
        if path.is_file():
            loader = TextLoader(str(path))
            docs = loader.load()
        else:
            loader = DirectoryLoader(
                str(path),
                glob="**/*.{md,txt,py,js,ts,tsx,json,yaml,yml}",
                loader_cls=TextLoader,
            )
            docs = loader.load()

        chunks = self.text_splitter.split_documents(docs)
        if chunks:
            self.vector_store.add_documents(chunks)

    def ingest_file(self, content: str, filename: str) -> None:
        from langchain_core.documents import Document
        doc = Document(page_content=content, metadata={"source": filename})
        chunks = self.text_splitter.split_documents([doc])
        if chunks:
            self.vector_store.add_documents(chunks)

    def reindex(self) -> None:
        self.clear()
        self.ingest()

    def search(self, query: str, k: int = 5) -> list[str]:
        results = self.vector_store.similarity_search(query, k=k)
        return [doc.page_content for doc in results]

    def clear(self):
        try:
            self.vector_store.delete_collection()
        except Exception:
            pass
