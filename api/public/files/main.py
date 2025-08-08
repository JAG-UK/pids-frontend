#!/usr/bin/env python3
"""
Main application entry point for the PIDS Data Explorer.

This module provides the core functionality for exploring and analyzing
datasets in the PIDS (Public Information Data System) platform.
"""

import json
import logging
from pathlib import Path
from typing import Dict, List, Optional

from .utils import DataProcessor, FileHandler
from .config import Config

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PIDSExplorer:
    """Main class for PIDS data exploration functionality."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize the PIDS Explorer.
        
        Args:
            config_path: Path to configuration file
        """
        self.config = Config(config_path)
        self.data_processor = DataProcessor()
        self.file_handler = FileHandler()
        
    def load_dataset(self, dataset_id: str) -> Dict:
        """Load a dataset by ID.
        
        Args:
            dataset_id: Unique identifier for the dataset
            
        Returns:
            Dataset information and metadata
        """
        try:
            dataset_path = self.config.get_dataset_path(dataset_id)
            dataset_data = self.file_handler.load_json(dataset_path)
            
            logger.info(f"Loaded dataset: {dataset_id}")
            return dataset_data
            
        except FileNotFoundError:
            logger.error(f"Dataset not found: {dataset_id}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"Invalid dataset format: {e}")
            raise
    
    def explore_files(self, dataset_id: str) -> List[Dict]:
        """Explore files within a dataset.
        
        Args:
            dataset_id: Unique identifier for the dataset
            
        Returns:
            List of file information
        """
        dataset = self.load_dataset(dataset_id)
        files = []
        
        for file_info in dataset.get('files', []):
            file_path = Path(dataset['path']) / file_info['name']
            if file_path.exists():
                file_info['size'] = file_path.stat().st_size
                file_info['modified'] = file_path.stat().st_mtime
                files.append(file_info)
        
        return files
    
    def preview_file(self, dataset_id: str, file_path: str) -> str:
        """Preview the contents of a file.
        
        Args:
            dataset_id: Unique identifier for the dataset
            file_path: Path to the file within the dataset
            
        Returns:
            File contents as string
        """
        try:
            full_path = self.config.get_dataset_path(dataset_id) / file_path
            return self.file_handler.read_file(full_path)
        except Exception as e:
            logger.error(f"Error previewing file {file_path}: {e}")
            raise


def main():
    """Main entry point for the application."""
    explorer = PIDSExplorer()
    
    # Example usage
    try:
        datasets = explorer.config.list_datasets()
        print(f"Available datasets: {datasets}")
        
        if datasets:
            dataset_id = datasets[0]
            files = explorer.explore_files(dataset_id)
            print(f"Files in {dataset_id}: {len(files)}")
            
    except Exception as e:
        logger.error(f"Application error: {e}")
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())
