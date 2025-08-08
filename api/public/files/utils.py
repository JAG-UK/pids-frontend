"""
Utility functions for the PIDS Data Explorer.

This module provides common utility functions used throughout the application.
"""

import hashlib
import mimetypes
import os
from pathlib import Path
from typing import Any, Dict, List, Optional, Union


class DataProcessor:
    """Handles data processing operations."""
    
    @staticmethod
    def calculate_file_hash(file_path: Union[str, Path]) -> str:
        """Calculate SHA-256 hash of a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            SHA-256 hash as hexadecimal string
        """
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    @staticmethod
    def get_file_metadata(file_path: Union[str, Path]) -> Dict[str, Any]:
        """Get metadata for a file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dictionary containing file metadata
        """
        path = Path(file_path)
        stat = path.stat()
        
        return {
            'name': path.name,
            'size': stat.st_size,
            'modified': stat.st_mtime,
            'created': stat.st_ctime,
            'is_file': path.is_file(),
            'is_dir': path.is_dir(),
            'extension': path.suffix,
            'mime_type': mimetypes.guess_type(str(path))[0]
        }
    
    @staticmethod
    def format_file_size(size_bytes: int) -> str:
        """Format file size in human-readable format.
        
        Args:
            size_bytes: Size in bytes
            
        Returns:
            Formatted size string (e.g., "1.5 MB")
        """
        for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
            if size_bytes < 1024.0:
                return f"{size_bytes:.1f} {unit}"
            size_bytes /= 1024.0
        return f"{size_bytes:.1f} PB"


class FileHandler:
    """Handles file operations."""
    
    @staticmethod
    def read_file(file_path: Union[str, Path], encoding: str = 'utf-8') -> str:
        """Read file contents as string.
        
        Args:
            file_path: Path to the file
            encoding: File encoding (default: utf-8)
            
        Returns:
            File contents as string
        """
        with open(file_path, 'r', encoding=encoding) as f:
            return f.read()
    
    @staticmethod
    def read_file_binary(file_path: Union[str, Path]) -> bytes:
        """Read file contents as bytes.
        
        Args:
            file_path: Path to the file
            
        Returns:
            File contents as bytes
        """
        with open(file_path, 'rb') as f:
            return f.read()
    
    @staticmethod
    def load_json(file_path: Union[str, Path]) -> Dict[str, Any]:
        """Load JSON file.
        
        Args:
            file_path: Path to the JSON file
            
        Returns:
            Parsed JSON data
        """
        import json
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    @staticmethod
    def save_json(data: Dict[str, Any], file_path: Union[str, Path]) -> None:
        """Save data to JSON file.
        
        Args:
            data: Data to save
            file_path: Path to save the JSON file
        """
        import json
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
    
    @staticmethod
    def list_files(directory: Union[str, Path], pattern: str = "*") -> List[Path]:
        """List files in a directory matching a pattern.
        
        Args:
            directory: Directory to search
            pattern: File pattern to match (default: all files)
            
        Returns:
            List of matching file paths
        """
        path = Path(directory)
        return list(path.glob(pattern))
    
    @staticmethod
    def ensure_directory(directory: Union[str, Path]) -> None:
        """Ensure a directory exists, create if it doesn't.
        
        Args:
            directory: Directory path
        """
        Path(directory).mkdir(parents=True, exist_ok=True)


def get_file_extension(file_path: Union[str, Path]) -> str:
    """Get file extension.
    
    Args:
        file_path: Path to the file
        
    Returns:
        File extension (including the dot)
    """
    return Path(file_path).suffix


def is_text_file(file_path: Union[str, Path]) -> bool:
    """Check if a file is a text file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if the file is a text file
    """
    text_extensions = {
        '.txt', '.md', '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css',
        '.scss', '.sass', '.json', '.xml', '.yaml', '.yml', '.toml', '.ini',
        '.cfg', '.conf', '.log', '.csv', '.sql', '.sh', '.bash', '.zsh'
    }
    return get_file_extension(file_path).lower() in text_extensions


def is_image_file(file_path: Union[str, Path]) -> bool:
    """Check if a file is an image file.
    
    Args:
        file_path: Path to the file
        
    Returns:
        True if the file is an image file
    """
    image_extensions = {
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg',
        '.ico', '.ico', '.heic', '.heif'
    }
    return get_file_extension(file_path).lower() in image_extensions
