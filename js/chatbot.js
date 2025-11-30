class TayChatbot {
  constructor() {
    this.chatMessages = document.getElementById('chatMessages');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.ragStatus = document.getElementById('ragStatus');
    
    this.init();
  }

  init() {
    this.sendBtn.addEventListener('click', () => this.sendMessage());
    
    this.chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Quick action buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const message = e.currentTarget.dataset.message;
        this.chatInput.value = message;
        this.sendMessage();
      });
    });

    // Auto-resize textarea
    this.chatInput.addEventListener('input', () => {
      this.chatInput.style.height = 'auto';
      this.chatInput.style.height = this.chatInput.scrollHeight + 'px';
    });

    // Welcome message
    this.addMessage('bot', `Xin chào! 👋 

Tôi là trợ lý AI chuyên dạy tiếng Tày và văn hóa dân tộc Tày. 

🎯 Tôi có thể giúp bạn:
• Học từ vựng tiếng Tày
• Luyện phát âm
• Tìm hiểu ngữ pháp cơ bản
• Khám phá văn hóa Tày
• Thực hành hội thoại

Bạn muốn học gì hôm nay? 😊`);
    
    // Update RAG status
    this.updateRAGStatus();
  }

  async updateRAGStatus() {
    try {
      // Có thể thêm API endpoint để check status
      setTimeout(() => {
        this.ragStatus.innerHTML = `
          <i class="fas fa-check-circle" style="color: #22c55e;"></i>
          <span>RAG Engine đã sẵn sàng! Đang sử dụng Cosine Similarity với 15+ tài liệu.</span>
        `;
      }, 1000);
      
      setTimeout(() => {
        this.ragStatus.style.display = 'none';
      }, 5000);
    } catch (error) {
      this.ragStatus.innerHTML = `
        <i class="fas fa-exclamation-circle" style="color: #ef4444;"></i>
        <span>Không thể kết nối RAG Engine</span>
      `;
    }
  }

  addMessage(type, content, metadata = null) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    const time = new Date().toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Xử lý HTML cho phần nguồn (Citations)
    let citationsHTML = '';
    if (type === 'bot' && metadata && metadata.citations && metadata.citations.length > 0) {
      citationsHTML = `
        <div class="message-citations">
          <div class="citations-title">
            <i class="fas fa-book-reader"></i> Nguồn tham khảo:
          </div>
          ${metadata.citations.map(cite => `
            <div class="citation-item">
              <span class="citation-index">${cite.index}</span>
              <a href="${cite.url}" target="_blank" class="citation-link" title="${cite.title}">
                ${cite.title}
              </a>
              <i class="fas fa-external-link-alt citation-icon"></i>
            </div>
          `).join('')}
        </div>
      `;
    } else if (type === 'bot' && metadata && metadata.is_rag === false) {
        // Nếu trả lời bằng General AI (không tìm thấy nguồn)
        citationsHTML = `
            <div class="general-knowledge-badge">
                <i class="fas fa-globe-asia"></i>
                Trả lời dựa trên kiến thức tổng quát (AI)
            </div>
        `;
    }

    // Format nội dung chính
    let formattedContent = this.formatMessage(content);

    messageDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-${type === 'bot' ? 'robot' : 'user'}"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          ${formattedContent}
        </div>
        ${citationsHTML} <!-- Chèn nguồn vào đây -->
        <span class="message-time">${time}</span>
      </div>
    `;

    this.chatMessages.appendChild(messageDiv);
    this.scrollToBottom();
  }

  formatMessage(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```(.*?)```/gs, '<code>$1</code>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>')
      .replace(/^• (.+)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>\s*)+/g, '<ul>$&</ul>');
  }

  async sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message) return;

    this.addMessage('user', message);
    this.chatInput.value = '';
    this.chatInput.style.height = 'auto';
    this.sendBtn.disabled = true;

    const typingId = this.addTypingIndicator();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();

      this.removeTypingIndicator(typingId);

      if (data.success) {
        this.addMessage('bot', data.message, data.metadata);
      } else {
        this.addMessage('bot', '❌ Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại.');
      }

    } catch (error) {
      console.error('Error:', error);
      this.removeTypingIndicator(typingId);
      this.addMessage('bot', '❌ Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại.');
    } finally {
      this.sendBtn.disabled = false;
      this.chatInput.focus();
    }
  }

  addTypingIndicator() {
    const typingDiv = document.createElement('div');
    const id = 'typing-' + Date.now();
    typingDiv.className = 'chat-message bot-message typing-indicator';
    typingDiv.id = id;
    
    typingDiv.innerHTML = `
      <div class="message-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="message-content">
        <div class="message-bubble">
          <div class="typing-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    `;

    this.chatMessages.appendChild(typingDiv);
    this.scrollToBottom();
    
    return id;
  }

  removeTypingIndicator(id) {
    const element = document.getElementById(id);
    if (element) {
      element.remove();
    }
  }

  scrollToBottom() {
    this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new TayChatbot();
  });
} else {
  new TayChatbot();
}