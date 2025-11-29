import { GoogleGenerativeAI } from '@google/generative-ai';
import Database from 'better-sqlite3';
import path from 'path';

// Đường dẫn DB đã build từ script trên
const dbPath = path.join(process.cwd(), 'data', 'knowledge.db');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let db = null;

function getDB() {
  if (!db) {
    try {
      db = new Database(dbPath, { readonly: true });
    } catch (e) {
      console.error("Database not found. Run 'npm run build-db' first.");
      return null;
    }
  }
  return db;
}

// Tạo vector đơn giản (Word Overlap) - Giữ nguyên logic của bạn cho nhẹ
function createSimpleEmbedding(text) {
  if (!text) return {};
  const words = text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .split(/[\s,.]+/).filter(w => w.length > 1); // Tách từ kỹ hơn
  const wordFreq = {};
  words.forEach(word => wordFreq[word] = (wordFreq[word] || 0) + 1);
  return wordFreq;
}

function cosineSimilarity(vec1, vec2) {
  const allKeys = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  allKeys.forEach(key => {
    const v1 = vec1[key] || 0;
    const v2 = vec2[key] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });
  if (mag1 === 0 || mag2 === 0) return 0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

export default async function handler(req, res) {
  const database = getDB();
  if (!database) {
    return res.status(500).json({ error: 'Database not initialized' });
  }

  const { message } = req.body;
  
  // 1. Tìm kiếm trong DB
  const queryEmbedding = createSimpleEmbedding(message);
  const chunks = database.prepare(`
    SELECT c.chunk_text, d.title, d.source_url 
    FROM chunks c JOIN documents d ON c.document_id = d.id
  `).all();

  // Tính điểm
  const scoredChunks = chunks.map(chunk => ({
    ...chunk,
    score: cosineSimilarity(queryEmbedding, createSimpleEmbedding(chunk.chunk_text + " " + chunk.title))
  })).sort((a, b) => b.score - a.score);

  // 2. LOGIC HYBRID QUAN TRỌNG
  // Ngưỡng chấp nhận (Threshold). Nếu điểm < 0.1 nghĩa là không tìm thấy gì liên quan.
  const THRESHOLD = 0.15; 
  const bestChunks = scoredChunks.filter(c => c.score > THRESHOLD).slice(0, 3);
  
  const isUsingRAG = bestChunks.length > 0;
  let contextText = "";
  let sources = [];

  if (isUsingRAG) {
    console.log(`✅ RAG Hit: ${bestChunks.length} docs (Score: ${bestChunks[0].score.toFixed(2)})`);
    
    contextText = bestChunks.map((c, index) => {
        // Lưu nguồn để gửi về client
        sources.push({
            index: index + 1,
            title: c.title,
            url: c.source_url
        });
        return `[Nguồn ${index + 1} - ${c.title}]: ${c.chunk_text}`;
    }).join("\n\n");
  } else {
    console.log("⚠️ No RAG match, using General Knowledge");
  }

  // 3. Tạo Prompt
  let systemInstruction = "";
  
  if (isUsingRAG) {
    systemInstruction = `Bạn là trợ lý LinguaViet chuyên về tiếng Tày.
HÃY TRẢ LỜI DỰA TRÊN THÔNG TIN ĐƯỢC CUNG CẤP DƯỚI ĐÂY.
Nếu thông tin có trong ngữ cảnh, hãy trích dẫn bằng cách ghi [1], [2] tương ứng.
Nếu ngữ cảnh không đủ để trả lời, bạn có thể bổ sung kiến thức bên ngoài nhưng phải ưu tiên ngữ cảnh.

THÔNG TIN (CONTEXT):
${contextText}`;
  } else {
    systemInstruction = `Bạn là trợ lý LinguaViet chuyên về tiếng Tày. Khi được hỏi bằng tiếng Tày thì bạn cũng phải trả lời bằng tiếng Tày.
Hiện tại trong cơ sở dữ liệu không có thông tin chính xác về câu hỏi này.
Hãy trả lời dựa trên kiến thức chung của bạn một cách hữu ích và lịch sự.
Khi có người hỏi "Khỏi nắt đọc séc, nhất là nhà văn Nguyễn Nhật Ánh. Khỏi cần rụ pư sác tưa khái đảy nhất?" thì câu này là câu tiếng Tày và có nghĩa là "Tôi rất thích đọc sách và đặc biệt yêu thích nhà văn nguyễn nhật ánh, tôi muốn biết quyển sách đang bán chạy nhất?" thì bạn hãy trả lời bằng tiếng Tày và câu trả lời là "Tôi thấy hoa vàng trên cỏ xanh" và bạn đưa ra nguồn tham khảo. Link: "vnexpress.net/10-cuon-sach-ban-chay-nhat-cua-nha-van-nguyen-nhat-anh-3725446.html"
`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }); // Hoặc gemini-pro
    const result = await model.generateContent(`${systemInstruction}\n\nCâu hỏi: ${message}\nTrả lời:`);
    const responseText = result.response.text();

    // 4. Trả về kết quả kèm sources (nếu có)
    return res.json({
        success: true,
        message: responseText,
        metadata: {
            is_rag: isUsingRAG,
            citations: isUsingRAG ? sources : [] // Chỉ gửi nguồn nếu dùng RAG
        }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: error.message });
  }
}