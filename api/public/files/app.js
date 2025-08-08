/**
 * PIDS Data Explorer - Frontend Application
 * 
 * This is the main JavaScript application for the PIDS Data Explorer
 * frontend interface.
 */

import { DataExplorer } from './modules/DataExplorer.js';
import { FileViewer } from './modules/FileViewer.js';
import { SearchEngine } from './modules/SearchEngine.js';
import { config } from './config/config.js';

class PIDSApp {
    constructor() {
        this.dataExplorer = new DataExplorer();
        this.fileViewer = new FileViewer();
        this.searchEngine = new SearchEngine();
        this.currentDataset = null;
        this.currentFile = null;
        
        this.init();
    }
    
    /**
     * Initialize the application
     */
    async init() {
        try {
            // Load configuration
            await this.loadConfig();
            
            // Initialize components
            this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            await this.loadInitialData();
            
            console.log('PIDS App initialized successfully');
        } catch (error) {
            console.error('Failed to initialize PIDS App:', error);
            this.showError('Failed to initialize application');
        }
    }
    
    /**
     * Load application configuration
     */
    async loadConfig() {
        try {
            const response = await fetch('/api/config');
            if (!response.ok) {
                throw new Error('Failed to load configuration');
            }
            
            const configData = await response.json();
            Object.assign(config, configData);
            
        } catch (error) {
            console.warn('Using default configuration:', error);
        }
    }
    
    /**
     * Initialize application components
     */
    initializeComponents() {
        // Initialize data explorer
        this.dataExplorer.init({
            container: document.getElementById('data-explorer'),
            onDatasetSelect: this.handleDatasetSelect.bind(this),
            onFileSelect: this.handleFileSelect.bind(this)
        });
        
        // Initialize file viewer
        this.fileViewer.init({
            container: document.getElementById('file-viewer'),
            onFileLoad: this.handleFileLoad.bind(this)
        });
        
        // Initialize search engine
        this.searchEngine.init({
            container: document.getElementById('search-container'),
            onSearch: this.handleSearch.bind(this)
        });
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', this.handleResize.bind(this));
        
        // Handle keyboard shortcuts
        document.addEventListener('keydown', this.handleKeydown.bind(this));
        
        // Handle navigation
        window.addEventListener('popstate', this.handleNavigation.bind(this));
    }
    
    /**
     * Load initial data
     */
    async loadInitialData() {
        try {
            const datasets = await this.dataExplorer.loadDatasets();
            this.dataExplorer.renderDatasets(datasets);
        } catch (error) {
            console.error('Failed to load initial data:', error);
            this.showError('Failed to load datasets');
        }
    }
    
    /**
     * Handle dataset selection
     */
    async handleDatasetSelect(datasetId) {
        try {
            this.currentDataset = await this.dataExplorer.loadDataset(datasetId);
            this.fileViewer.clear();
            
            // Update URL
            this.updateURL(`/dataset/${datasetId}`);
            
            // Load files for the dataset
            const files = await this.dataExplorer.loadFiles(datasetId);
            this.dataExplorer.renderFiles(files);
            
        } catch (error) {
            console.error('Failed to load dataset:', error);
            this.showError('Failed to load dataset');
        }
    }
    
    /**
     * Handle file selection
     */
    async handleFileSelect(filePath) {
        try {
            this.currentFile = filePath;
            
            // Load file content
            const content = await this.fileViewer.loadFile(
                this.currentDataset.id,
                filePath
            );
            
            // Update URL
            this.updateURL(`/dataset/${this.currentDataset.id}/file/${encodeURIComponent(filePath)}`);
            
        } catch (error) {
            console.error('Failed to load file:', error);
            this.showError('Failed to load file');
        }
    }
    
    /**
     * Handle file load completion
     */
    handleFileLoad(fileInfo) {
        // Update breadcrumb
        this.updateBreadcrumb(fileInfo);
        
        // Update document title
        document.title = `${fileInfo.name} - PIDS Explorer`;
    }
    
    /**
     * Handle search
     */
    async handleSearch(query) {
        try {
            const results = await this.searchEngine.search(query);
            this.dataExplorer.renderSearchResults(results);
        } catch (error) {
            console.error('Search failed:', error);
            this.showError('Search failed');
        }
    }
    
    /**
     * Handle window resize
     */
    handleResize() {
        // Recalculate layouts
        this.dataExplorer.handleResize();
        this.fileViewer.handleResize();
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeydown(event) {
        // Ctrl/Cmd + F: Focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'f') {
            event.preventDefault();
            this.searchEngine.focus();
        }
        
        // Escape: Clear search
        if (event.key === 'Escape') {
            this.searchEngine.clear();
        }
    }
    
    /**
     * Handle navigation
     */
    handleNavigation(event) {
        const path = window.location.pathname;
        const match = path.match(/\/dataset\/([^\/]+)(?:\/file\/(.+))?/);
        
        if (match) {
            const datasetId = match[1];
            const filePath = match[2] ? decodeURIComponent(match[2]) : null;
            
            this.handleDatasetSelect(datasetId);
            if (filePath) {
                this.handleFileSelect(filePath);
            }
        }
    }
    
    /**
     * Update URL without page reload
     */
    updateURL(path) {
        const url = new URL(window.location);
        url.pathname = path;
        window.history.pushState({}, '', url);
    }
    
    /**
     * Update breadcrumb navigation
     */
    updateBreadcrumb(fileInfo) {
        const breadcrumb = document.getElementById('breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <span class="breadcrumb-item">
                    <a href="/datasets">Datasets</a>
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item">
                    <a href="/dataset/${this.currentDataset.id}">${this.currentDataset.name}</a>
                </span>
                <span class="breadcrumb-separator">/</span>
                <span class="breadcrumb-item active">${fileInfo.name}</span>
            `;
        }
    }
    
    /**
     * Show error message
     */
    showError(message) {
        // Implementation for showing error messages
        console.error(message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PIDSApp();
});

export default PIDSApp;
