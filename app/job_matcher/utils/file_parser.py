import pathlib
import os
import docx2txt
import PyPDF2

class FileParser:

    def extract_text_from_file(self, file_path):

        # try:
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")
            
        extension = pathlib.Path(file_path).suffix.lower()
        if extension == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif extension in [".doc", ".docx"]:
            return docx2txt.process(file_path).strip()
        elif extension == ".txt":
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read().strip()
        else:
            raise ValueError(f"Unsupported file type: {extension}")
    
        # except Exception as e:
        #     raise ValueError(f"Error reading file: {e}")
        
        return None


    def extract_text_from_pdf(self, file_path):
        text = ""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                for page in range(len(reader.pages)):
                    text += reader.pages[page].extract_text() + "\n"
            return text.strip()
        except Exception as e:
            print(f"Error with PyPDF2: {e}")
            return ""
