console.log('🔧 Loading RAG Engine...');

class RAGEngine {
    constructor() {
        this.knowledgeBase = [];
        this.vectorizer = null;
        this.initialized = false;
        console.log('RAGEngine constructor called');
    }

    // Initialize RAG engine with knowledge base
    async initialize() {
        console.log('🚀 Initializing RAG Engine...');
        
        try {
            // Load knowledge base
            this.knowledgeBase = this.loadKnowledgeBase();
            console.log(`✅ Loaded ${this.knowledgeBase.length} documents`);
            
            // Create TF-IDF vectorizer
            this.vectorizer = new TFIDFVectorizer();
            await this.vectorizer.fit(this.knowledgeBase.map(doc => doc.content));
            console.log(`✅ Vectorizer ready with ${Object.keys(this.vectorizer.vocabulary).length} terms`);
            
            this.initialized = true;
            console.log('✅ RAG Engine initialized successfully!');
            
            return true;
        } catch (error) {
            console.error('❌ RAG Engine initialization failed:', error);
            throw error;
        }
    }

    // Load knowledge base about Tày language and culture
    loadKnowledgeBase() {
        return [
            // VOCABULARY - 6 documents
            {
                id: 'vocab_greetings',
                category: 'vocabulary',
                topic: 'greetings',
                content: 'Các cách chào hỏi trong tiếng Tày: Slương cáo (xin chào chung), Slương cáo pa (chào ông), Slương cáo ma (chào bà), Slương cáo pó (chào anh), Slương cáo nống (chào chị). Người Tày rất coi trọng lễ nghi và thứ bậc trong chào hỏi. Khi gặp người lớn tuổi, người trẻ phải chào trước và cúi đầu nhẹ.',
                keywords: ['chào', 'xin chào', 'lời chào', 'greetings', 'slương cáo', 'chào hỏi']
            },
            {
                id: 'vocab_basic',
                category: 'vocabulary',
                topic: 'basic_words',
                content: 'Từ vựng cơ bản tiếng Tày hàng ngày: Kẩu (tôi), Mưng (bạn), Man (họ), Kin khảu (ăn cơm), Khắp cũn (cảm ơn), Slương mả (tạm biệt), Pai (đi), Ma (đến), Slương (xin), Nɤn (ngủ), Hạ (yêu), Tó (lớn), Nói (nhỏ), Đệ (tốt), Hấy (rồi/xong). Đây là những từ thường dùng nhất trong giao tiếp.',
                keywords: ['từ vựng', 'cơ bản', 'basic', 'vocabulary', 'kẩu', 'mưng', 'từ thường dùng']
            },
            {
                id: 'vocab_family',
                category: 'vocabulary',
                topic: 'family',
                content: 'Từ vựng về gia đình trong tiếng Tày: Pa (cha/ông), Ma (mẹ/bà), Pó (anh/chú), Nống (chị/dì), Ai (em), Lủng (con), Pú (ông nội/ngoại), Tái (bà nội/ngoại), Hẻo (anh họ), Máy (chị họ), Bố (cháu), Pja (vợ), Fai (chồng). Gia đình là trung tâm của xã hội Tày.',
                keywords: ['gia đình', 'family', 'pa', 'ma', 'họ hàng', 'người thân', 'relatives']
            },
            {
                id: 'vocab_numbers',
                category: 'vocabulary',
                topic: 'numbers',
                content: 'Số đếm trong tiếng Tày từ 1-10: Nưng (một), Slống (hai), Sam (ba), Sli (bốn), Hả (năm), Sluk (sáu), Chét (bảy), Pét (tám), Káo (chín), Sip (mười). Số lớn hơn: Slống sip (20), Sam sip (30), Hoi nưng (100), Nưng phan (1000). Cách đếm: Sip nưng (11), Sip slống (12).',
                keywords: ['số đếm', 'numbers', 'đếm số', 'nưng', 'slống', 'counting', 'số']
            },
            {
                id: 'vocab_food',
                category: 'vocabulary',
                topic: 'food',
                content: 'Từ vựng về ẩm thực Tày: Khảu (cơm), Nặm (nước), Pà (cá), Mɯ (gà), Slủ (thịt lợn), Khẩu sli (thịt hun khói đặc sản), Cốm lảm (cơm lam nướng trong ống tre), Pắc pía (món gỏi cá sống), Kin (ăn), Kín (uống), Hẳm (ngon), Khớm (chua), Khem (mặn).',
                keywords: ['ẩm thực', 'food', 'món ăn', 'khảu', 'kin', 'thức ăn', 'đồ ăn']
            },
            {
                id: 'vocab_time',
                category: 'vocabulary',
                topic: 'time',
                content: 'Thời gian trong tiếng Tày: Ngày (van), Tháng (pưn), Năm (pí), Hôm nay (van ni), Ngày mai (van khựn), Hôm qua (van mán), Sáng (táo), Trưa (tiang), Chiều (hạm), Tối (kam), Đêm (khuân), Tuần (píu), Giờ (chưng mống).',
                keywords: ['thời gian', 'time', 'ngày', 'tháng', 'năm', 'van', 'clock', 'date']
            },

            // GRAMMAR - 6 documents
            {
                id: 'grammar_sentence_structure',
                category: 'grammar',
                topic: 'sentence_structure',
                content: 'Cấu trúc câu tiếng Tày theo trật tự SVO (Chủ ngữ - Động từ - Tân ngữ), giống tiếng Việt. Ví dụ: "Kẩu kin khảu" (Tôi ăn cơm), "Mưng pai sɯa" (Bạn đi chợ), "Man ma slương" (Họ đến chùa). Tính từ thường đứng sau danh từ, khác với tiếng Việt: "Pà tó" (cá lớn), "Slương đệ" (người tốt).',
                keywords: ['ngữ pháp', 'grammar', 'cấu trúc câu', 'sentence', 'SVO', 'syntax', 'câu']
            },
            {
                id: 'grammar_tones',
                category: 'grammar',
                topic: 'tones',
                content: 'Tiếng Tày có 6 thanh điệu tương tự tiếng Việt nhưng cách phát âm khác: A (ngang), À (huyền), Á (sắc), Ả (hỏi), Ã (ngã), Ạ (nặng). Thanh điệu rất quan trọng vì thay đổi thanh có thể đổi nghĩa hoàn toàn. Ví dụ: ma (đến) khác với mà (mẹ). Người học cần luyện tập thanh điệu nhiều.',
                keywords: ['thanh điệu', 'tones', 'phát âm', 'pronunciation', 'giọng', 'âm']
            },
            {
                id: 'grammar_pronouns',
                category: 'grammar',
                topic: 'pronouns',
                content: 'Đại từ nhân xưng tiếng Tày: Ngôi thứ nhất - Kẩu/Au (tôi), Háu (chúng tôi), Pủ háu (chúng ta); Ngôi thứ hai - Mưng (bạn), Mó (các bạn); Ngôi thứ ba - Man (họ/anh ấy/cô ấy), Pủ man (những người đó). Cách xưng hô phụ thuộc vào độ tuổi, giới tính và mối quan hệ xã hội.',
                keywords: ['đại từ', 'pronouns', 'xưng hô', 'kẩu', 'mưng', 'man', 'personal pronouns']
            },
            {
                id: 'grammar_negation',
                category: 'grammar',
                topic: 'negation',
                content: 'Phủ định trong tiếng Tày dùng "ặt" hoặc "khɯn" đặt trước động từ. Ví dụ: "Kẩu ặt pai" (Tôi không đi), "Man khɯn kin" (Họ không ăn), "Mưng ặt hủ" (Bạn không biết). "Ặt" dùng phổ biến hơn trong hội thoại thường ngày, "khɯn" mang tính trang trọng hơn.',
                keywords: ['phủ định', 'negation', 'không', 'ặt', 'khɯn', 'negative', 'deny']
            },
            {
                id: 'grammar_questions',
                category: 'grammar',
                topic: 'questions',
                content: 'Câu hỏi tiếng Tày: Câu hỏi yes/no thêm "mɛ̀" hoặc "pớ" cuối câu. Ví dụ: "Mưng pai mɛ̀?" (Bạn đi không?). Từ để hỏi: Pài (ai), Ăn cáy/Hạy cáy (cái gì), Lẻo cáy (ở đâu), Mùa cáy (khi nào), Ối lạ (tại sao), Cái nà (như thế nào), Pại lạ (bao nhiêu).',
                keywords: ['câu hỏi', 'questions', 'hỏi', 'question words', 'mɛ̀', 'interrogative']
            },
            {
                id: 'grammar_verbs',
                category: 'grammar',
                topic: 'verbs',
                content: 'Động từ tiếng Tày không chia theo thời gian, thay vào đó dùng trạng từ thời gian. Ví dụ: "Kẩu kin khảu" (Tôi ăn cơm - hiện tại/quá khứ/tương lai tùy ngữ cảnh). Thêm từ chỉ thời gian: "Kẩu kin khảu hảy" (Tôi đã ăn cơm), "Kẩu cáng kin khảu" (Tôi sẽ ăn cơm), "Kẩu láng kin khảu" (Tôi đang ăn cơm).',
                keywords: ['động từ', 'verbs', 'verb', 'thời gian', 'tense', 'action']
            },

            // CULTURE - 8 documents
            {
                id: 'culture_overview',
                category: 'culture',
                topic: 'overview',
                content: 'Người Tày là dân tộc thiểu số đông thứ 2 Việt Nam với khoảng 1.8 triệu người (theo điều tra 2019), chủ yếu sinh sống ở các tỉnh miền núi phía Bắc như Cao Bằng, Lạng Sơn, Bắc Kạn, Thái Nguyên, Tuyên Quang. Họ có nền văn hóa phong phú với kiến trúc nhà sàn độc đáo, nghệ thuật dân gian và lễ hội truyền thống. Người Tày sống hòa hợp với thiên nhiên, canh tác lúa nước và có hệ thống tín ngưỡng đa dạng.',
                keywords: ['văn hóa', 'culture', 'dân tộc Tày', 'tày', 'ethnic', 'minority', 'overview']
            },
            {
                id: 'culture_sluong',
                category: 'culture',
                topic: 'music',
                content: 'Hát Sluông (hay còn gọi là Then) là nghệ thuật biểu diễn dân gian đặc sắc của người Tày, thường được hát trong các lễ hội, cưới hỏi và nghi lễ tâm linh. Then là loại hình nghệ thuật tổng hợp âm nhạc, thơ ca, múa và tín ngưỡng, được UNESCO công nhận là Di sản văn hóa phi vật thể đại diện của nhân loại năm 2019. Nhạc cụ chính là đàn tính (đàn hai dây) và các loại trống, cồng.',
                keywords: ['hát sluông', 'then', 'âm nhạc', 'music', 'nghệ thuật', 'folk', 'unesco']
            },
            {
                id: 'culture_festivals',
                category: 'culture',
                topic: 'festivals',
                content: 'Lễ hội truyền thống của người Tày: Lễ cúng Cầu mưa (mùa xuân - cầu mưa thuận gió hòa), Lễ hội Lồng Tông (ngày mồng 1 tháng giêng - đầu năm mới), Lễ hội Then (nghi lễ tâm linh cầu bình an), Tết Nguyên Đán (giống người Kinh). Các lễ hội thường có hát Then, hát Sluông, múa xòe, chọi gà, đánh đu, ném pao và các trò chơi dân gian.',
                keywords: ['lễ hội', 'festivals', 'cầu mưa', 'lồng tông', 'then', 'tradition', 'festival']
            },
            {
                id: 'culture_architecture',
                category: 'culture',
                topic: 'architecture',
                content: 'Nhà sàn là kiến trúc truyền thống của người Tày, thường có 3 gian, mái lợp ngói âm dương hoặc tranh. Gian giữa là chỗ thờ cúng tổ tiên, hai bên là phòng ngủ. Dưới gầm nhà dùng làm chuồng gia súc và kho chứa nông cụ. Nhà sàn thể hiện sự thích nghi thông minh với địa hình miền núi và khí hậu ẩm ướt, giúp tránh lũ lụt và động vật hoang dã.',
                keywords: ['nhà sàn', 'architecture', 'kiến trúc', 'stilt house', 'traditional house', 'nhà ở']
            },
            {
                id: 'culture_food',
                category: 'culture',
                topic: 'cuisine',
                content: 'Ẩm thực Tày đặc trưng với các món: Khẩu sli (thịt lợn hun khói - món đặc sản nổi tiếng), Cốm lảm (cơm lam nướng trong ống tre non), Pắc pía (gỏi cá sống ướp gia vị), Chẻ mể (bánh giầy nếp trắng), Rượu cần (rượu uống bằng ống tre trong lễ hội). Món ăn thường dùng nguyên liệu từ rừng núi, chế biến đơn giản nhưng giữ được hương vị tự nhiên.',
                keywords: ['ẩm thực', 'cuisine', 'food', 'khẩu sli', 'cốm lảm', 'món ăn', 'đặc sản']
            },
            {
                id: 'culture_costume',
                category: 'culture',
                topic: 'costume',
                content: 'Trang phục truyền thống người Tày: Phụ nữ mặc áo cánh dài màu chàm (xanh đen nhuộm từ cây chàm), váy hoặc quần thêu hoa văn tinh xảo, khăn piêu đội đầu, đeo trang sức bạc như vòng cổ, vòng tay, hoa tai. Nam giới mặc áo cánh ngắn cổ đứng, quần ống rộng màu đen hoặc nâu. Màu chàm (indigo) là màu đặc trưng, tượng trưng cho sự giản dị và gắn bó với thiên nhiên.',
                keywords: ['trang phục', 'costume', 'áo cánh', 'chàm', 'indigo', 'clothing', 'traditional dress']
            },
            {
                id: 'culture_beliefs',
                category: 'culture',
                topic: 'beliefs',
                content: 'Tín ngưỡng của người Tày rất đa dạng: thờ cúng tổ tiên (quan trọng nhất), tín ngưỡng Then (thờ trời đất, thần linh núi rừng, sông suối), thờ thần Nông (thần lúa nước bảo vệ mùa màng). Họ tin vào linh hồn tự nhiên, ma quỷ và sức mạnh siêu nhiên. Thầy Then (thầy cúng) đóng vai trò quan trọng trong các nghi lễ tâm linh, chữa bệnh và cầu bình an.',
                keywords: ['tín ngưỡng', 'beliefs', 'religion', 'then', 'thờ cúng', 'spiritual', 'faith']
            },
            {
                id: 'culture_calendar',
                category: 'culture',
                topic: 'calendar',
                content: 'Người Tày sử dụng âm lịch giống người Kinh. Năm mới Tày (Tết Nguyên Đán) là dịp lễ quan trọng nhất, bắt đầu từ 30 Tết với các nghi lễ giao thừa, mâm cỗ tổ tiên, lì xì. Các tháng trong năm có tên riêng liên quan đến nông nghiệp và thiên nhiên. Người Tày cũng có những ngày kỵ và ngày tốt theo phong tục truyền thống.',
                keywords: ['lịch', 'calendar', 'tết', 'new year', 'âm lịch', 'lunar calendar', 'festival']
            },

            // LEARNING - 5 documents
            {
                id: 'learning_tips_beginners',
                category: 'learning',
                topic: 'tips',
                content: 'Cách học tiếng Tày hiệu quả cho người mới bắt đầu: 1) Bắt đầu với 50-100 từ vựng cơ bản thường dùng nhất (chào hỏi, số đếm, gia đình). 2) Luyện phát âm thanh điệu mỗi ngày 15-20 phút bằng cách nghe và bắt chước. 3) Học qua bài hát, ca dao Tày trên YouTube. 4) Thực hành với người bản ngữ nếu có thể. 5) Dùng flashcard (thẻ ghi nhớ) để ôn từ vựng. 6) Học theo chủ đề thực tế như gia đình, thức ăn, thời gian. 7) Đọc truyện song ngữ Tày-Việt.',
                keywords: ['học', 'learning', 'tips', 'study', 'mẹo học', 'how to learn', 'phương pháp']
            },
            {
                id: 'learning_pronunciation',
                category: 'learning',
                topic: 'pronunciation',
                content: 'Luyện phát âm tiếng Tày: Tập trung vào các âm đặc biệt như ɯ (u không tròn môi), ɤ (o không tròn môi) mà tiếng Việt không có. Luyện thanh điệu bằng cách so sánh với tiếng Việt vì cùng có 6 thanh nhưng phát âm hơi khác. Nghe và bắt chước người bản ngữ qua video, audio. Ghi âm giọng mình và so sánh. Luyện từng cặp âm tương phản: pa-ba, ta-da, ka-ga. Đọc to các câu mẫu mỗi ngày.',
                keywords: ['phát âm', 'pronunciation', 'speaking', 'luyện nói', 'practice', 'phonetics']
            },
            {
                id: 'learning_resources',
                category: 'learning',
                topic: 'resources',
                content: 'Tài nguyên học tiếng Tày: 1) Sách giáo khoa tiếng Tày của Bộ Giáo dục và Đào tạo (dùng trong trường học vùng dân tộc). 2) Từ điển Tày-Việt-Tày của nhà xuất bản Văn hóa Dân tộc. 3) Video dạy tiếng Tày trên YouTube (kênh của Ban Dân tộc các tỉnh). 4) Ứng dụng LinguaViet này. 5) Các trang web của Ban Dân tộc tỉnh Cao Bằng, Lạng Sơn. 6) Tài liệu PDF miễn phí từ Ủy ban Dân tộc. Nên kết hợp nhiều nguồn để học toàn diện.',
                keywords: ['tài liệu', 'resources', 'sách', 'books', 'materials', 'học liệu', 'study materials']
            },
            {
                id: 'learning_common_mistakes',
                category: 'learning',
                topic: 'mistakes',
                content: 'Lỗi thường gặp khi học tiếng Tày: 1) Nhầm lẫn thanh điệu vì tiếng Việt và Tày có 6 thanh nhưng phát âm khác. 2) Đặt tính từ trước danh từ (theo tiếng Việt) thay vì sau danh từ (đúng trong tiếng Tày). 3) Quên thêm từ chỉ loại khi đếm danh từ. 4) Dùng sai đại từ nhân xưng không phù hợp với mối quan hệ. 5) Phát âm âm ɯ, ɤ không đúng. Cần luyện tập và sửa lỗi thường xuyên.',
                keywords: ['lỗi', 'mistakes', 'errors', 'common mistakes', 'sai lầm', 'pitfalls']
            },
            {
                id: 'learning_practice',
                category: 'learning',
                topic: 'practice',
                content: 'Cách thực hành tiếng Tày hiệu quả: 1) Nói chuyện với người Tày mỗi ngày nếu có thể. 2) Tham gia các nhóm học tiếng Tày trên Facebook. 3) Viết nhật ký bằng tiếng Tày (dù chỉ vài câu). 4) Xem phim, video clip của người Tày trên YouTube. 5) Nghe nhạc Tày và học thuộc lời. 6) Dùng app LinguaViet để luyện dịch mỗi ngày. 7) Đặt mục tiêu cụ thể: ví dụ học 10 từ mới/ngày. Kiên trì 15-30 phút/ngày tốt hơn học dồn.',
                keywords: ['thực hành', 'practice', 'luyện tập', 'exercise', 'speaking practice', 'training']
            },

            // COMPARISON - 3 documents
            {
                id: 'compare_similarities',
                category: 'comparison',
                topic: 'similarities',
                content: 'Điểm giống nhau giữa tiếng Tày và tiếng Việt: 1) Cùng cấu trúc câu SVO (Chủ ngữ - Động từ - Tân ngữ). 2) Cùng có 6 thanh điệu. 3) Nhiều từ vay mượn từ tiếng Hán (khoảng 30% từ vựng Tày có gốc Hán). 4) Không có biến đổi hình thái động từ, danh từ (không chia theo số, thời). 5) Dùng từ chỉ loại (classifiers) khi đếm danh từ. 6) Trật tự từ trong câu tương đối tự do. Những điểm giống này giúp người Việt học tiếng Tày dễ dàng hơn.',
                keywords: ['so sánh', 'comparison', 'giống nhau', 'similarities', 'tiếng việt', 'vietnamese', 'alike']
            },
            {
                id: 'compare_differences',
                category: 'comparison',
                topic: 'differences',
                content: 'Điểm khác nhau giữa tiếng Tày và tiếng Việt: 1) Từ vựng gốc hoàn toàn khác (Tày thuộc ngữ hệ Tai-Kadai, Việt thuộc Austroasiatic). 2) Phát âm thanh điệu khác nhau dù cùng 6 thanh. 3) Tiếng Tày có nguyên âm ɯ, ɤ không có trong tiếng Việt chuẩn. 4) Ít phụ âm cuối hơn tiếng Việt. 5) Thứ tự tính từ-danh từ ngược lại (Tày: danh từ + tính từ). 6) Cách xưng hô đơn giản hơn. 7) Hệ thống phụ âm đầu khác. Những khác biệt này cần chú ý khi học.',
                keywords: ['khác biệt', 'differences', 'so sánh', 'comparison', 'distinct', 'different', 'contrast']
            },
            {
                id: 'compare_writing',
                category: 'comparison',
                topic: 'writing',
                content: 'So sánh chữ viết Tày và Việt: Cả hai đều dùng chữ Latinh nhưng có khác biệt. Chữ Tày (được chuẩn hóa năm 1961) có thêm các ký tự đặc biệt: ɯ, ɤ, và cách đánh dấu thanh điệu hơi khác. Trước đây người Tày dùng chữ Nôm Tày và chữ Hán. Chữ Quốc ngữ Việt Nam do Alexandre de Rhodes phát triển từ thế kỷ 17, trong khi chữ Latinh Tày mới được tạo ra vào thế kỷ 20. Ngày nay cả hai đều dễ học và sử dụng.',
                keywords: ['chữ viết', 'writing', 'script', 'alphabet', 'so sánh', 'latinh', 'comparison']
            },

            // PHONETICS - 2 documents
            {
                id: 'phonetics_consonants',
                category: 'phonetics',
                topic: 'consonants',
                content: 'Phụ âm trong tiếng Tày: Phụ âm đầu: p, t, k, ʔ (thanh hầu), b, d, m, n, ng, l, s, sl, h, v, f. Phụ âm cuối chỉ có: -p, -t, -k, -m, -n, -ng. Tiếng Tày ít phụ âm cuối hơn tiếng Việt rất nhiều, không có -c/-ch, -nh riêng biệt như tiếng Việt. Điều này làm tiếng Tày nghe "nhẹ nhàng" hơn. Phụ âm "sl" là đặc trưng của tiếng Tày, phát âm như "s" và "l" cùng lúc.',
                keywords: ['phụ âm', 'consonants', 'âm', 'phát âm', 'pronunciation', 'sounds']
            },
            {
                id: 'phonetics_vowels',
                category: 'phonetics',
                topic: 'vowels',
                content: 'Nguyên âm tiếng Tày: Nguyên âm đơn: a, e, i, o, u, ɯ (u không tròn môi - âm đặc biệt), ɤ (o không tròn môi - âm đặc biệt). Nguyên âm đôi: ai, ao, au, ia, ua, ɯa, oi, ưi. Âm ɯ phát âm bằng cách giữ hình miệng như âm "i" nhưng phát âm "u". Âm ɤ giữ hình miệng như "ơ" nhưng không tròn môi. Hai âm này là khó nhất đối với người Việt học tiếng Tày.',
                keywords: ['nguyên âm', 'vowels', 'vowel', 'phát âm', 'pronunciation', 'sounds', 'ɯ', 'ɤ']
            },

            // HISTORY - 1 document
            {
                id: 'history_language',
                category: 'history',
                topic: 'language_history',
                content: 'Lịch sử ngôn ngữ Tày: Tiếng Tày thuộc ngữ hệ Tai-Kadai (còn gọi là Kra-Dai), có nguồn gốc từ miền nam Trung Quốc cách đây hơn 2000 năm. Tổ tiên người Tày di cư vào Việt Nam từ thế kỷ thứ 8-10. Tiếng Tày chịu ảnh hưởng của tiếng Hán qua nhiều thế kỷ thống trị phong kiến. Chữ viết Latinh Tày được tạo ra năm 1961 để thay thế chữ Nôm Tày và Hán. Hiện nay có nhiều phương ngữ khác nhau: Tày Cao Bằng, Tày Lạng Sơn, Tày Bắc Kạn-Thái Nguyên.',
                keywords: ['lịch sử', 'history', 'nguồn gốc', 'origin', 'evolution', 'historical', 'past']
            },

            // PHRASES - 2 documents
            {
                id: 'phrases_daily',
                category: 'phrases',
                topic: 'daily_conversation',
                content: 'Cụm từ giao tiếp hàng ngày bằng tiếng Tày: "Mưng kin khảu hảy mɛ̀?" (Bạn ăn cơm chưa? - câu hỏi thăm hỏi phổ biến), "Kẩu pai sɯa" (Tôi đi chợ), "Chúa nó" hoặc "Slương mả" (Tạm biệt nhé), "Man lẻo cáy?" (Họ ở đâu?), "Kẩu khɯn hủ" (Tôi không biết), "Slương cáo láng ngày mới" (Chào buổi sáng), "Nɤn ngon nó" (Ngủ ngon nhé), "Khắp cũn láng" (Cảm ơn nhiều).',
                keywords: ['cụm từ', 'phrases', 'giao tiếp', 'conversation', 'hội thoại', 'speaking', 'daily']
            },
            {
                id: 'phrases_courtesy',
                category: 'phrases',
                topic: 'courtesy',
                content: 'Cụm từ lịch sự và cảm xúc tiếng Tày: "Khắp cũn" hoặc "Khắp cũn láng" (Cảm ơn, cảm ơn nhiều), "Slương mà lỗi" (Xin lỗi), "Khɯn pẻn hạy" (Không sao đâu), "Ối lạ" hoặc "Slương" (Làm ơn), "Chúa may mán" (Chúc may mắn), "Sú nó sức khỏe" (Chúc sức khỏe), "Kẩu hạ mưng" (Tôi yêu bạn - dùng trong gia đình), "Mưng đệ láng" (Bạn tốt quá).',
                keywords: ['lịch sự', 'courtesy', 'polite', 'manners', 'xin lỗi', 'cảm ơn', 'emotions']
            }
        ];
    }

    // Retrieve relevant documents
    async retrieve(query, topK = 3) {
        if (!this.initialized) {
            console.error('❌ RAG Engine not initialized');
            throw new Error('RAG Engine not initialized. Please wait for initialization.');
        }

        console.log(`🔍 Retrieving documents for query: "${query}"`);

        try {
            // Vectorize query
            const queryVector = await this.vectorizer.transform([query]);
            
            // Calculate similarity scores
            const scores = this.knowledgeBase.map((doc, idx) => {
                const keywordScore = this.calculateKeywordScore(query, doc.keywords);
                const docVector = this.vectorizer.documentVectors[idx];
                const tfidfScore = this.cosineSimilarity(queryVector[0], docVector);
                const combinedScore = (tfidfScore * 0.6) + (keywordScore * 0.4);
                
                return { doc, score: combinedScore, tfidfScore, keywordScore };
            });

            // Sort and get top K
            scores.sort((a, b) => b.score - a.score);
            const topDocs = scores.slice(0, topK);
            
            console.log(`✅ Found ${topDocs.length} relevant documents`);
            topDocs.forEach((item, idx) => {
                console.log(`  ${idx + 1}. ${item.doc.topic} (score: ${item.score.toFixed(3)})`);
            });
            
            return topDocs;
        } catch (error) {
            console.error('❌ Retrieval error:', error);
            throw error;
        }
    }

    // Calculate keyword matching score
    calculateKeywordScore(query, keywords) {
        const queryLower = query.toLowerCase();
        const matchedKeywords = keywords.filter(kw => 
            queryLower.includes(kw.toLowerCase()) || 
            kw.toLowerCase().includes(queryLower)
        );
        return matchedKeywords.length / Math.max(keywords.length, 1);
    }

    // Cosine similarity
    cosineSimilarity(vec1, vec2) {
        if (!vec1 || !vec2) return 0;
        
        let dotProduct = 0, norm1 = 0, norm2 = 0;
        
        for (let key in vec1) {
            const val1 = vec1[key] || 0;
            const val2 = vec2[key] || 0;
            dotProduct += val1 * val2;
            norm1 += val1 * val1;
        }
        
        for (let key in vec2) {
            norm2 += (vec2[key] || 0) ** 2;
        }
        
        norm1 = Math.sqrt(norm1);
        norm2 = Math.sqrt(norm2);
        
        return (norm1 === 0 || norm2 === 0) ? 0 : dotProduct / (norm1 * norm2);
    }

    // Category labels
    getCategoryLabel(category) {
        const labels = {
            'vocabulary': 'Từ vựng', 'grammar': 'Ngữ pháp', 'culture': 'Văn hóa',
            'phonetics': 'Ngữ âm', 'learning': 'Học tập', 'comparison': 'So sánh',
            'history': 'Lịch sử', 'phrases': 'Cụm từ'
        };
        return labels[category] || category;
    }

    // Topic labels
    getTopicLabel(topic) {
        const labels = {
            'greetings': 'Chào hỏi', 'basic_words': 'Từ vựng cơ bản', 'family': 'Gia đình',
            'numbers': 'Số đếm', 'food': 'Ẩm thực', 'time': 'Thời gian',
            'sentence_structure': 'Cấu trúc câu', 'tones': 'Thanh điệu', 'pronouns': 'Đại từ',
            'negation': 'Phủ định', 'questions': 'Câu hỏi', 'verbs': 'Động từ',
            'overview': 'Tổng quan', 'music': 'Âm nhạc', 'festivals': 'Lễ hội',
            'architecture': 'Kiến trúc', 'cuisine': 'Ẩm thực', 'costume': 'Trang phục',
            'beliefs': 'Tín ngưỡng', 'calendar': 'Lịch', 'tips': 'Mẹo học tập',
            'pronunciation': 'Phát âm', 'resources': 'Tài liệu', 'mistakes': 'Lỗi thường gặp',
            'practice': 'Thực hành', 'similarities': 'Điểm giống', 'differences': 'Điểm khác',
            'writing': 'Chữ viết', 'consonants': 'Phụ âm', 'vowels': 'Nguyên âm',
            'language_history': 'Lịch sử ngôn ngữ', 'daily_conversation': 'Hội thoại hàng ngày',
            'courtesy': 'Lịch sự'
        };
        return labels[topic] || topic;
    }
}

// TF-IDF Vectorizer
class TFIDFVectorizer {
    constructor() {
        this.vocabulary = {};
        this.idf = {};
        this.documentVectors = [];
    }

    tokenize(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđɯɤ]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 1);
    }

    tf(term, document) {
        const tokens = this.tokenize(document);
        const count = tokens.filter(t => t === term).length;
        return count / Math.max(tokens.length, 1);
    }

    async fit(documents) {
        // Build vocabulary
        documents.forEach(doc => {
            this.tokenize(doc).forEach(token => {
                if (!this.vocabulary[token]) {
                    this.vocabulary[token] = Object.keys(this.vocabulary).length;
                }
            });
        });

        // Calculate IDF
        Object.keys(this.vocabulary).forEach(term => {
            const docsWithTerm = documents.filter(doc => 
                this.tokenize(doc).includes(term)
            ).length;
            this.idf[term] = Math.log(documents.length / (1 + docsWithTerm));
        });

        // Create document vectors
        this.documentVectors = documents.map(doc => this.transformSingle(doc));
    }

    transformSingle(document) {
        const vector = {};
        const tokens = this.tokenize(document);
        const uniqueTokens = [...new Set(tokens)];
        
        uniqueTokens.forEach(term => {
            if (this.vocabulary[term] !== undefined) {
                vector[term] = this.tf(term, document) * (this.idf[term] || 0);
            }
        });
        
        return vector;
    }

    async transform(documents) {
        return documents.map(doc => this.transformSingle(doc));
    }
}

// Export to global scope
window.RAGEngine = RAGEngine;
window.TFIDFVectorizer = TFIDFVectorizer;

console.log('✅ RAG Engine loaded successfully');