// ===== BENCHMARK SECTION JAVASCRIPT =====

const filterBtns = document.querySelectorAll('.filter-btn');
const benchmarkRows = document.querySelectorAll('.benchmark-table tbody tr');

// Filter functionality
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const filter = btn.getAttribute('data-direction');
        
        // Filter rows
        benchmarkRows.forEach(row => {
            const direction = row.getAttribute('data-direction');
            
            if (filter === 'all' || direction === filter) {
                row.style.display = '';
                row.style.animation = 'fadeIn 0.3s ease';
            } else {
                row.style.display = 'none';
            }
        });
    });
});

// Highlight best scores
function highlightBestScores() {
    // Get all BLEU scores
    const bleuScores = Array.from(document.querySelectorAll('.benchmark-table .score:nth-child(4)'));
    const meteorScores = Array.from(document.querySelectorAll('.benchmark-table .score:nth-child(5)'));
    
    // Find max values
    const maxBLEU = Math.max(...bleuScores.map(s => parseFloat(s.textContent)));
    const maxMETEOR = Math.max(...meteorScores.map(s => parseFloat(s.textContent)));
    
    // Highlight max scores
    bleuScores.forEach(score => {
        if (parseFloat(score.textContent) === maxBLEU) {
            score.classList.add('highlight');
        }
    });
    
    meteorScores.forEach(score => {
        if (parseFloat(score.textContent) === maxMETEOR) {
            score.classList.add('highlight');
        }
    });
}

// Run on load
highlightBestScores();

// Sortable table columns (optional enhancement)
function makeSortable() {
    const table = document.querySelector('.benchmark-table');
    const headers = table.querySelectorAll('th');
    const tbody = table.querySelector('tbody');
    
    headers.forEach((header, index) => {
        // Skip first column (model name)
        if (index === 0) return;
        
        header.style.cursor = 'pointer';
        header.setAttribute('title', 'Click to sort');
        
        let ascending = true;
        
        header.addEventListener('click', () => {
            const rows = Array.from(tbody.querySelectorAll('tr'));
            
            rows.sort((a, b) => {
                const aValue = a.cells[index].textContent.trim();
                const bValue = b.cells[index].textContent.trim();
                
                // Try to parse as number
                const aNum = parseFloat(aValue);
                const bNum = parseFloat(bValue);
                
                if (!isNaN(aNum) && !isNaN(bNum)) {
                    return ascending ? aNum - bNum : bNum - aNum;
                }
                
                return ascending 
                    ? aValue.localeCompare(bValue) 
                    : bValue.localeCompare(aValue);
            });
            
            // Clear and re-append sorted rows
            rows.forEach(row => tbody.appendChild(row));
            
            // Toggle sort direction
            ascending = !ascending;
            
            // Visual feedback
            headers.forEach(h => h.style.background = '');
            header.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    });
}

// Uncomment to enable sortable columns
// makeSortable();

// Add animation CSS
const benchmarkStyle = document.createElement('style');
benchmarkStyle.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(benchmarkStyle);

// Export data functionality (bonus feature)
function exportToCSV() {
    const table = document.querySelector('.benchmark-table');
    const rows = table.querySelectorAll('tr');
    
    let csv = [];
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = Array.from(cols).map(col => {
            let text = col.textContent.trim();
            // Escape quotes
            text = text.replace(/"/g, '""');
            return `"${text}"`;
        });
        csv.push(rowData.join(','));
    });
    
    const csvContent = csv.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'linguaviet_benchmark.csv';
    link.click();
}

// Add export button (optional)
function addExportButton() {
    const benchmarkSection = document.querySelector('.benchmark-section .container');
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-outline';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Tải về CSV';
    exportBtn.style.marginTop = 'var(--spacing-lg)';
    exportBtn.onclick = exportToCSV;
    
    benchmarkSection.appendChild(exportBtn);
}

// Uncomment to add export functionality
// addExportButton();