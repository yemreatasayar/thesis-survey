/* =============================================================================
   SURVEY CONTENT — bilingual (EN / TR). Edit everything here.
   -----------------------------------------------------------------------------
   Every participant-facing string is L("English", "Türkçe").
   Answers are stored by option INDEX (not text), so the language toggle never
   affects given answers. 1–7 scales use {low, high} endpoint anchors.

   Source: "Consumer Acceptance Survey ENG.docx" + "...TR.docx" (final, 26 Qs).
   Display number prefix: "Q" in English, "S" in Turkish (handled in app.js).
   ========================================================================== */

function L(en, tr) { return { en: en, tr: tr }; }

const SURVEY = {
  // The thesis language is English, so the title stays English in both modes.
  title: L("Consumer Acceptance of\nAI-Driven Customer Service",
           "Consumer Acceptance of\nAI-Driven Customer Service"),

  ui: {
    back:    L("BACK", "GERİ"),
    next:    L("NEXT", "İLERİ"),
    send:    L("SEND", "GÖNDER"),
    progress:L("PROGRESS", "İLERLEME"),
    author:  L("by Yusuf Emre Atasayar", "hazırlayan Yusuf Emre Atasayar"),
    chatbot: L("Chatbot", "Chatbot"),
    customer:L("You", "Siz"),
    confirmTitle: L("Are you sure?", "Emin misiniz?"),
    confirmBody:  L("Once you send, your responses are submitted and cannot be changed.",
                    "Gönderdikten sonra yanıtlarınız iletilir ve değiştirilemez."),
    confirmYes:   L("YES, SEND", "EVET, GÖNDER"),
    confirmNo:    L("GO BACK", "GERİ DÖN"),
    endedTitle: L("Thank you for your interest", "İlginiz için teşekkürler"),
    endedBody:  L("Based on your response, this survey is not applicable to you. You may now close this page. No data has been collected.",
                  "Verdiğiniz yanıt doğrultusunda bu anket size uygun değildir. Bu sayfayı kapatabilirsiniz. Hiçbir veri toplanmamıştır."),
    sending: L("Sending your responses…", "Yanıtlarınız gönderiliyor…"),
    ok:      L("✓ Your responses were recorded. You may close this page.", "✓ Yanıtlarınız kaydedildi. Bu sayfayı kapatabilirsiniz."),
    err:     L("Could not send your responses. Please check your connection — your answers are kept on this page.",
               "Yanıtlarınız gönderilemedi. Lütfen bağlantınızı kontrol edin — cevaplarınız bu sayfada saklanıyor."),
  },

  // 1–7 scales — only the two endpoint anchors are shown
  scales: {
    satisfaction: { low: L("Extremely dissatisfied", "Hiç memnun kalmadım"), high: L("Extremely satisfied", "Çok memnun kaldım") },
    willingness:  { low: L("Extremely unwilling", "Hiç istekli olmam"),       high: L("Extremely willing", "Çok istekli olurum") },
    complexity:   { low: L("Not at all complex", "Hiç karmaşık değil"),       high: L("Extremely complex", "Çok karmaşık") },
    agreement:    { low: L("Strongly disagree", "Kesinlikle katılmıyorum"),   high: L("Strongly agree", "Kesinlikle katılıyorum") },
  },

  sections: [
    // ---------------------------------------------------------------- INTRO
    {
      id: "intro", type: "intro", progress: 0, card: "#ffffee",
      title: L("Participant Information", "Katılımcı Bilgilendirmesi"),
      body: [
        L("This survey is part of a Master's thesis examining consumer attitudes toward AI-driven customer-service chatbots in e-commerce. It takes approximately 6–8 minutes.",
          "Bu anket, e-ticaret sektöründe yapay zeka destekli müşteri hizmetleri chatbot'larına yönelik tüketici tutumlarını inceleyen bir yüksek lisans tezinin parçasıdır. Anketi tamamlamak yaklaşık 6-8 dakika sürmektedir."),
        L("Participation is voluntary and anonymous. No personally identifiable information is collected. You may leave the survey at any time.",
          "Katılım tamamen gönüllülük esasına dayanır ve anonimdir. Hiçbir kişisel veri toplanmamaktadır. Anketi dilediğiniz zaman yarıda bırakabilirsiniz."),
        L("In this survey, a customer-service chatbot means an automated, text-based system that communicates with customers and assists with service-related requests (not a voice assistant, not a recommendation engine).",
          "Bu ankette geçen \"müşteri hizmetleri chatbot'u\" ifadesi, müşterilerle yazışarak iletişim kuran ve hizmet taleplerine yardımcı olan otomatik sistemleri (sesli asistanlar veya ürün öneri sistemleri değil) ifade etmektedir."),
      ],
    },

    // ------------------------------------------------------ SECTION 1: CONSENT
    {
      id: "consent", type: "questions", progress: 1, card: "#e9fffe", group: true,
      section: L("Section 1", "Bölüm 1"),
      title: L("Consent and Eligibility", "Onay ve Uygunluk"),
      questions: [
        { id: "Q1", type: "binary", endIfNo: true,
          text: L("I confirm that I am at least 18 years old and voluntarily agree to participate in this study.",
                  "18 yaşından büyük olduğumu onaylıyor ve bu çalışmaya katılmayı gönüllü olarak kabul ediyorum.") },
        { id: "Q2", type: "binary", endIfNo: true,
          text: L("Do you currently live in Turkey?", "Şu anda Türkiye'de mi yaşıyorsunuz?") },
        { id: "Q3", type: "binary", endIfNo: true,
          text: L("Have you purchased a product or service online within the last six months?",
                  "Son altı ay içinde internetten herhangi bir ürün veya hizmet satın aldınız mı?") },
      ],
    },

    // -------------------------------------------------- SECTION 2: EXPERIENCE
    {
      id: "experience", type: "questions", progress: 2, card: "#f0faff",
      section: L("Section 2", "Bölüm 2"),
      title: L("Previous Chatbot Experience", "Önceki Chatbot Deneyimi"),
      questions: [
        { id: "Q4", type: "single", skipIfFirst: ["Q5", "Q6", "Q7"],
          text: L("How many times have you used a customer-service chatbot during the last 12 months?",
                  "Son 12 ay içinde bir müşteri hizmetleri chatbot'unu kaç kez kullandınız?"),
          options: [
            L("Never", "Hiç kullanmadım"),
            L("Once", "1 kez"),
            L("2–3 times", "2-3 kez"),
            L("4–6 times", "4-6 kez"),
            L("7 or more times", "7 kez veya daha fazla"),
          ] },

        { id: "Q5", type: "multiple",
          text: L("How did your most recent chatbot-supported customer-service interaction end?",
                  "Chatbot destekli en son müşteri hizmetleri deneyiminiz nasıl sonuçlandı?"),
          options: [
            L("The issue was fully resolved", "Sorunum tamamen çözüldü"),
            L("The issue was partially resolved", "Sorunum kısmen çözüldü"),
            L("The issue was not resolved during the interaction, but I later resolved it through another channel",
              "Konuşma sırasında çözülmedi, ancak daha sonra başka bir kanaldan çözdüm"),
            L("The issue remained unresolved", "Sorunum çözülemedi"),
            L("I do not remember", "Hatırlamıyorum"),
          ] },

        { id: "Q6", type: "likert", scale: "satisfaction",
          text: L("Overall, how satisfied were you with your most recent customer-service chatbot interaction?",
                  "Genel olarak düşündüğünüzde, en son müşteri hizmetleri chatbot deneyiminizden ne kadar memnun kaldınız?") },

        { id: "Q7", type: "multiple",
          text: L("During your most recent chatbot interaction, were you transferred to a human representative?",
                  "En son chatbot deneyiminiz sırasında bir canlı destek uzmanına (insan temsilciye) aktarıldınız mı?"),
          options: [
            L("No, I was not transferred", "Hayır, aktarılmadım"),
            L("Yes, and the information I had provided was transferred to the representative",
              "Evet, aktarıldım ve chatbot'a verdiğim bilgiler uzmana iletildi"),
            L("Yes, but I had to explain the issue again", "Evet, aktarıldım ama sorunumu uzmana tekrar anlatmak zorunda kaldım"),
            L("Yes, but I do not remember whether the information was transferred",
              "Evet, aktarıldım ama bilgilerimin iletilip iletilmediğini hatırlamıyorum"),
            L("I do not remember", "Hatırlamıyorum"),
          ] },

        { id: "Q8", type: "multiple",
          text: L("Which customer-service channel would you normally prefer as your first option?",
                  "Normal şartlarda ilk tercih edeceğiniz müşteri hizmetleri kanalı hangisidir?"),
          options: [
            L("AI-driven chatbot", "Yapay zeka destekli chatbot"),
            L("Live chat with a human representative", "Canlı destek (insan temsilci ile yazışma)"),
            L("Telephone", "Telefon"),
            L("Email", "E-posta"),
            L("Social media or messaging application", "Sosyal medya veya mesajlaşma uygulamaları"),
            L("I have no specific preference", "Belirli bir tercihim yok"),
            L("Other", "Diğer"),
          ] },

        { id: "Q9", type: "single",
          text: L("How often do you shop online?", "Ne sıklıkla internetten alışveriş yaparsınız?"),
          options: [
            L("Less than once a month", "Ayda birden az"),
            L("Approximately once a month", "Yaklaşık ayda bir kez"),
            L("2–3 times a month", "Ayda 2-3 kez"),
            L("Approximately once a week", "Yaklaşık haftada bir kez"),
            L("Several times a week", "Haftada birkaç kez"),
          ] },
      ],
    },

    // ----------------------------------- SECTION 3: ACCEPTANCE & COMPLEXITY
    {
      id: "tasks", type: "questions", progress: 3, card: "#f6fff2",
      section: L("Section 3", "Bölüm 3"),
      title: L("Acceptance and Complexity Across Tasks", "Görev Bazlı Kabul ve Karmaşıklık"),
      questions: [
        { id: "Q10", type: "matrix", scale: "willingness",
          text: L("How willing would you be to use an AI-driven chatbot as the first point of contact in each of the following situations?",
                  "Aşağıdaki durumların her biri için ilk temas noktası olarak yapay zeka destekli bir chatbot kullanmaya ne kadar istekli olursunuz?"),
          rows: [
            L("Obtaining information about a product", "Bir ürün hakkında bilgi almak"),
            L("Checking the current location of an order", "Siparişin nerede olduğunu kontrol etmek"),
            L("Starting a product return", "Bir ürün iadesi başlatmak"),
            L("Reporting a package marked as delivered but not received", "\"Teslim edildi\" görünen ama ulaşmayan bir paketi bildirmek"),
            L("Disputing an incorrect payment or charge", "Hatalı bir ödeme veya ücretlendirmeye itiraz etmek"),
          ] },

        { id: "Q11", type: "matrix", scale: "complexity",
          text: L("Independently of whether the task is handled by a chatbot or a human representative, how complex do you consider each of the following customer-service situations?",
                  "Görevin bir chatbot veya insan temsilci tarafından yürütülmesinden bağımsız olarak, aşağıdaki müşteri hizmetleri durumlarının her birini ne kadar karmaşık buluyorsunuz?"),
          rows: [
            L("Obtaining information about a product", "Bir ürün hakkında bilgi almak"),
            L("Checking the current location of an order", "Siparişin nerede olduğunu kontrol etmek"),
            L("Starting a product return", "Bir ürün iadesi başlatmak"),
            L("Reporting a package marked as delivered but not received", "\"Teslim edildi\" görünen ama ulaşmayan bir paketi bildirmek"),
            L("Disputing an incorrect payment or charge", "Hatalı bir ödeme veya ücretlendirmeye itiraz etmek"),
          ] },
      ],
    },

    // ------------------------------------------------- SECTION 4: SCENARIO
    {
      id: "scenario", type: "scenario", progress: 4, card: "#eefffb",
      section: L("Section 4", "Bölüm 4"),
      title: L("Customer-Service Scenario", "Müşteri Hizmetleri Senaryosu"),
      intro: L("Imagine that you ordered a product from an online marketplace. The delivery tracking page shows that the package was delivered yesterday, but you have not received it. You open the platform's AI-driven customer-service chatbot. The following conversation takes place:",
               "Bir e-ticaret platformundan ürün sipariş ettiniz. Kargo takip sayfasında paketinizin dün teslim edildiği yazıyor, ancak paketi teslim almadınız. Platformun yapay zeka destekli müşteri hizmetleri chatbot'unu açıyorsunuz. Aranızda şu konuşma geçiyor:"),
      dialogue: [
        { who: "bot", text: L("I can help you with a delivery issue. Is this about order #48271?",
                              "Teslimatla ilgili bir sorunda size yardımcı olabilirim. Bu durum #48271 numaralı siparişle mi ilgili?") },
        { who: "you", text: L("Yes.", "Evet.") },
        { who: "bot", text: L("Please check whether the package was left at your building entrance, reception area, another safe location, or with a neighbour or household member.",
                              "Lütfen paketin bina girişine, resepsiyona, başka bir güvenli noktaya, bir komşunuza veya evdeki başka birine bırakılıp bırakılmadığını kontrol edin.") },
        { who: "you", text: L("I have already checked all of these places. The package is still missing.",
                              "Bu yerlerin hepsini zaten kontrol ettim. Paket hala ortada yok.") },
        { who: "bot", text: L("Thank you for confirming. I can see that the delivery company marked the order as delivered yesterday, but I cannot confirm where the package was left.",
                              "Onayınız için teşekkürler. Kargo firmasının siparişi dün teslim edildi olarak işaretlediğini görebiliyorum ancak paketin tam olarak nereye bırakıldığını teyit edemiyorum.") },
      ],
      // Each version's message is shown as several consecutive chatbot bubbles
      versions: {
        A: [
          { who: "bot", text: L("According to our records, your order has been delivered.",
                                "Kayıtlarımıza göre siparişiniz teslim edilmiştir.") },
          { who: "bot", text: L("Please check your delivery address, building entrance, reception area, safe locations, and ask your neighbours or household members whether they received the package.",
                                "Lütfen teslimat adresinizi, bina girişini, resepsiyonu, güvenli noktaları kontrol edin; komşularınıza veya hane halkına paketi teslim alıp almadıklarını sorun.") },
          { who: "bot", text: L("Delivery information may sometimes take up to 24 hours to update. Please try again later if you still cannot locate your order. We recommend checking your delivery location again tomorrow.",
                                "Teslimat bilgilerinin güncellenmesi bazen 24 saati bulabilmektedir. Paketinizi hala bulamıyorsanız lütfen daha sonra tekrar deneyin. Yarın teslimat noktanızı tekrar kontrol etmenizi öneririz.") },
          { who: "bot", text: L("Is there anything else I can help you with?",
                                "Size yardımcı olabileceğim başka bir konu var mı?") },
        ],
        B: [
          { who: "bot", text: L("I have created a support request for your missing package and included your order details and the information from this conversation.",
                                "Kayıp paketiniz için bir destek talebi oluşturdum. Bu talebe sipariş detaylarınızı ve şu ana kadar konuştuğumuz bilgileri ekledim.") },
          { who: "bot", text: L("Your reference number is MP-48271. Your case will be reviewed by one of our customer-service representatives, and you will receive a response through the app and by email within 24 hours at the latest.",
                                "Referans numaranız MP-48271'dir. Durumunuz müşteri temsilcilerimizden biri tarafından incelenecek ve en geç 24 saat içinde uygulama üzerinden ve e-posta yoluyla bir yanıt alacaksınız.") },
          { who: "bot", text: L("Is there anything else I can help you with?",
                                "Size yardımcı olabileceğim başka bir konu var mı?") },
        ],
      },
    },

    // ----------------------------------------------- SECTION 5: EVALUATION
    {
      id: "evaluation", type: "questions", progress: 4, card: "#eefffb",
      withScenario: "scenario", chunk: 3,   // 3 questions per card beside the conversation
      section: L("Section 4", "Bölüm 4"),
      title: L("Evaluation of the Scenario", "Senaryonun Değerlendirilmesi"),
      questions: [
        { id: "Q12", type: "likert", scale: "agreement",
          text: L("The chatbot took into account the information I had already provided.",
                  "Chatbot, daha önce verdiğim bilgileri dikkate aldı.") },
        { id: "Q13", type: "likert", scale: "agreement",
          text: L("The chatbot took a concrete step toward resolving the problem.",
                  "Chatbot, sorunu çözmeye yönelik somut bir adım attı.") },
        { id: "Q14", type: "likert", scale: "agreement",
          text: L("The chatbot provided a clear and traceable follow-up process for the unresolved issue.",
                  "Chatbot, çözülemeyen bu sorun için net ve takip edilebilir bir sonraki adım sundu.") },
        { id: "Q15", type: "likert", scale: "agreement",
          text: L("The chatbot appeared to understand the nature of the problem.",
                  "Chatbot, problemin ne olduğunu anlamış gibi görünüyordu.") },
        { id: "Q16", type: "likert", scale: "agreement",
          text: L("The chatbot appeared competent in identifying the appropriate next step.",
                  "Chatbot, atılması gereken doğru adımı belirlemede yetkin görünüyordu.") },
        { id: "Q17", type: "likert", scale: "agreement",
          text: L("The chatbot's response would be useful in dealing with this issue.",
                  "Chatbot'un verdiği yanıt bu sorunun çözülmesinde faydalı olurdu.") },
        { id: "Q18", type: "likert", scale: "agreement",
          text: L("Using this chatbot would reduce the effort required to resolve the issue.",
                  "Bu chatbot'u kullanmak, sorunu çözmek için harcamam gereken eforu azaltırdı.") },
        { id: "Q19", type: "likert", scale: "agreement",
          text: L("I would accept this chatbot as the first point of contact for customer service.",
                  "Müşteri hizmetlerinde ilk temas noktası olarak bu chatbot'u kullanmayı kabul ederim.") },
        { id: "Q20", type: "likert", scale: "agreement",
          text: L("I would be willing to continue with the customer-service process presented in this scenario.",
                  "Bu senaryoda sunulan müşteri hizmetleri süreciyle devam etmeye istekli olurum.") },
        { id: "Q21", type: "likert", scale: "agreement",
          text: L("I would use the same chatbot again for a similar problem.",
                  "Benzer bir sorunla karşılaştığımda aynı chatbot'u tekrar kullanırım.") },
        { id: "Q22", type: "likert", scale: "agreement",
          text: L("I would be comfortable relying on this chatbot to initiate the resolution process.",
                  "Çözüm sürecini başlatması için bu chatbot'a güvenme konusunda kendimi rahat hissederim.") },

        { id: "Q23", type: "multiple", solo: true,   // long question — its own card
          text: L("After this chatbot interaction, what would you most likely do?",
                  "Bu chatbot görüşmesinden sonra büyük ihtimalle ne yapardınız?"),
          options: [
            L("Follow the chatbot's suggested next step and wait before taking further action",
              "Chatbot'un önerdiği adımı izler ve başka bir işlem yapmadan önce beklerdim"),
            L("Start a new chatbot conversation", "Yeni bir chatbot konuşması başlatırdım"),
            L("Try to reach customer service through another channel", "Müşteri hizmetlerine başka bir kanaldan ulaşmaya çalışırdım"),
            L("Contact the delivery company directly", "Doğrudan kargo firmasıyla iletişime geçerdim"),
            L("Stop pursuing the issue for now", "Şimdilik sorunun peşini bırakırdım"),
            L("I am not sure", "Emin değilim"),
          ] },
      ],
    },

    // -------------------------------------------- SECTION 6: DEMOGRAPHICS
    {
      id: "demographics", type: "questions", progress: 5, card: "#fffaf5",
      section: L("Section 6", "Bölüm 6"),
      title: L("Demographic Information", "Demografik Bilgiler"),
      questions: [
        { id: "Q24", type: "single",
          text: L("What is your age group?", "Yaş grubunuz nedir?"),
          options: [
            L("18-24", "18-24"), L("25-34", "25-34"), L("35-44", "35-44"),
            L("45-54", "45-54"), L("55-64", "55-64"),
            L("65 or older", "65 veya üzeri"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q25", type: "single",
          text: L("What is the highest level of education you have completed?", "Tamamladığınız en yüksek eğitim seviyesi nedir?"),
          options: [
            L("Primary school", "İlkokul"), L("Secondary school", "Ortaokul"), L("High school", "Lise"),
            L("Associate degree", "Önlisans"), L("Bachelor's degree", "Lisans"),
            L("Master's degree", "Yüksek Lisans"), L("Doctoral degree", "Doktora"),
            L("Other", "Diğer"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q26", type: "single",
          text: L("What is your gender?", "Cinsiyetiniz?"),
          options: [
            L("Female", "Kadın"), L("Male", "Erkek"), L("Non-binary", "Non-binary"),
            L("Prefer to self-describe", "Kendim ifade etmek istiyorum"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },
      ],
    },

    // -------------------------------------------------------- THANK YOU
    {
      id: "thanks", type: "thanks", progress: 5, card: "#f0faff",
      title: L("Thank you so much\nfor your participation!", "Katılımınız için\nçok teşekkürler!"),
      body: L("Your responses contribute to research on consumer acceptance of AI-driven customer service in e-commerce.",
              "Yanıtlarınız, e-ticarette yapay zeka destekli müşteri hizmetlerinin tüketici kabulü üzerine yapılan araştırmalara katkı sağlar."),
    },
  ],
};
