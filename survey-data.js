/* =============================================================================
   SURVEY CONTENT — bilingual (EN / TR). Edit everything here.
   -----------------------------------------------------------------------------
   Every participant-facing string is L("English", "Türkçe").
   The language toggle just switches which side is shown; answers are stored by
   option INDEX (not text), so changing language never affects given answers.

   One question is shown per screen (card). Screen/question types & branching
   are documented in app.js. `progress` (0–5) drives the "PROGRESS n/5" label.
   ========================================================================== */

// Bilingual string helper
function L(en, tr) { return { en: en, tr: tr }; }

const SURVEY = {
  title: L("Consumer Acceptance of\nAI-Driven Customer Service",
           "Yapay Zekâ Destekli Müşteri\nHizmetlerinin Tüketici Kabulü"),

  ui: {
    back:    L("BACK", "GERİ"),
    next:    L("NEXT", "İLERİ"),
    send:    L("SEND", "GÖNDER"),
    progress:L("PROGRESS", "İLERLEME"),
    author:  L("by Yusuf Emre Atasayar", "hazırlayan Yusuf Emre Atasayar"),
    chatbot: L("Chatbot", "Sohbet Botu"),
    you:     L("You", "Siz"),
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

  // Shared 1–7 scales (re-used by several questions)
  scales: {
    satisfaction: {
      en: ["Extremely dissatisfied", "Moderately dissatisfied", "Slightly dissatisfied", "Neither satisfied nor dissatisfied", "Slightly satisfied", "Moderately satisfied", "Extremely satisfied"],
      tr: ["Son derece memnuniyetsiz", "Oldukça memnuniyetsiz", "Biraz memnuniyetsiz", "Ne memnun ne memnuniyetsiz", "Biraz memnun", "Oldukça memnun", "Son derece memnun"],
    },
    willingness: {
      en: ["Extremely unwilling", "Moderately unwilling", "Slightly unwilling", "Neither willing nor unwilling", "Slightly willing", "Moderately willing", "Extremely willing"],
      tr: ["Son derece isteksiz", "Oldukça isteksiz", "Biraz isteksiz", "Ne istekli ne isteksiz", "Biraz istekli", "Oldukça istekli", "Son derece istekli"],
    },
    complexity: {
      en: ["Not at all complex", "Slightly complex", "Somewhat complex", "Moderately complex", "Very complex", "Highly complex", "Extremely complex"],
      tr: ["Hiç karmaşık değil", "Biraz karmaşık", "Kısmen karmaşık", "Orta düzeyde karmaşık", "Oldukça karmaşık", "Yüksek düzeyde karmaşık", "Son derece karmaşık"],
    },
    agreement: {
      en: ["Strongly disagree", "Disagree", "Somewhat disagree", "Neither agree nor disagree", "Somewhat agree", "Agree", "Strongly agree"],
      tr: ["Kesinlikle katılmıyorum", "Katılmıyorum", "Kısmen katılmıyorum", "Ne katılıyorum ne katılmıyorum", "Kısmen katılıyorum", "Katılıyorum", "Kesinlikle katılıyorum"],
    },
  },

  sections: [
    // ---------------------------------------------------------------- INTRO
    {
      id: "intro", type: "intro", progress: 0, card: "#ffffee",
      title: L("Participant Information", "Katılımcı Bilgilendirmesi"),
      body: [
        L("This survey is part of a Master's thesis examining consumer attitudes toward AI-driven customer-service chatbots in e-commerce. It takes approximately 6–8 minutes.",
          "Bu anket, e-ticarette yapay zekâ destekli müşteri hizmetleri sohbet botlarına yönelik tüketici tutumlarını inceleyen bir yüksek lisans tezinin parçasıdır. Yaklaşık 6–8 dakika sürer."),
        L("Participation is voluntary and anonymous. No personally identifiable information is collected. You may leave the survey at any time.",
          "Katılım gönüllü ve anonimdir. Kimliğinizi belirleyecek hiçbir bilgi toplanmaz. Anketi istediğiniz an bırakabilirsiniz."),
        L("In this survey, a customer-service chatbot means an automated, text-based system that communicates with customers and assists with service-related requests (not a voice assistant, not a recommendation engine).",
          "Bu ankette müşteri hizmetleri sohbet botu, müşterilerle iletişim kuran ve hizmetle ilgili taleplere yardımcı olan otomatik, metin tabanlı bir sistemi ifade eder (sesli asistan veya öneri motoru değildir)."),
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
                  "En az 18 yaşında olduğumu ve bu çalışmaya gönüllü olarak katılmayı kabul ettiğimi onaylıyorum.") },
        { id: "Q2", type: "binary", endIfNo: true,
          text: L("Do you currently live in Turkey?", "Şu anda Türkiye'de mi yaşıyorsunuz?") },
        { id: "Q3", type: "binary", endIfNo: true,
          text: L("Have you purchased a product or service online within the last six months?",
                  "Son altı ay içinde internetten bir ürün veya hizmet satın aldınız mı?") },
      ],
    },

    // -------------------------------------------------- SECTION 2: EXPERIENCE
    {
      id: "experience", type: "questions", progress: 2, card: "#f0faff",
      section: L("Section 2", "Bölüm 2"),
      title: L("Previous Chatbot Experience", "Önceki Sohbet Botu Deneyimi"),
      questions: [
        { id: "Q4", type: "single", skipIfFirst: ["Q5", "Q6", "Q7"],
          text: L("How many times have you used a customer-service chatbot during the last 12 months?",
                  "Son 12 ayda kaç kez bir müşteri hizmetleri sohbet botu kullandınız?"),
          options: [
            L("Never", "Hiç"),
            L("Once", "Bir kez"),
            L("2–3 times", "2–3 kez"),
            L("4–6 times", "4–6 kez"),
            L("7 or more times", "7 veya daha fazla"),
          ] },

        { id: "Q5", type: "multiple",
          text: L("What was the outcome of your most recent customer-service chatbot interaction?",
                  "En son müşteri hizmetleri sohbet botu etkileşiminizin sonucu ne oldu?"),
          options: [
            L("The chatbot fully resolved my request", "Sohbet botu talebimi tamamen çözdü"),
            L("The chatbot partially resolved my request", "Sohbet botu talebimi kısmen çözdü"),
            L("I was transferred to a human representative, and the issue was resolved", "Bir müşteri temsilcisine aktarıldım ve sorun çözüldü"),
            L("I had to use another customer-service channel", "Başka bir müşteri hizmetleri kanalını kullanmak zorunda kaldım"),
            L("The issue remained unresolved", "Sorun çözülmeden kaldı"),
            L("I do not remember", "Hatırlamıyorum"),
          ] },

        { id: "Q6", type: "likert", scale: "satisfaction",
          text: L("Overall, how satisfied were you with your most recent customer-service chatbot interaction?",
                  "Genel olarak, en son müşteri hizmetleri sohbet botu etkileşiminizden ne kadar memnun kaldınız?") },

        { id: "Q7", type: "multiple",
          text: L("During your most recent chatbot interaction, were you transferred to a human representative?",
                  "En son sohbet botu etkileşiminiz sırasında bir müşteri temsilcisine aktarıldınız mı?"),
          options: [
            L("No, I was not transferred", "Hayır, aktarılmadım"),
            L("Yes, and the information I had provided was transferred to the representative", "Evet ve verdiğim bilgiler temsilciye aktarıldı"),
            L("Yes, but I had to explain the issue again", "Evet, ancak sorunu yeniden anlatmak zorunda kaldım"),
            L("Yes, but I do not remember whether the information was transferred", "Evet, ancak bilgilerin aktarılıp aktarılmadığını hatırlamıyorum"),
            L("I do not remember", "Hatırlamıyorum"),
          ] },

        { id: "Q8", type: "multiple",
          text: L("Which customer-service channel would you normally prefer as your first option?",
                  "Müşteri hizmetlerinde ilk tercihiniz olarak normalde hangi kanalı seçerdiniz?"),
          options: [
            L("AI-driven chatbot", "Yapay zekâ destekli sohbet botu"),
            L("Live chat with a human representative", "Bir temsilciyle canlı sohbet"),
            L("Telephone", "Telefon"),
            L("Email", "E-posta"),
            L("Social media or messaging application", "Sosyal medya veya mesajlaşma uygulaması"),
            L("I have no specific preference", "Belirli bir tercihim yok"),
            L("Other", "Diğer"),
          ] },

        { id: "Q9", type: "single",
          text: L("How often do you shop online?", "İnternetten ne sıklıkla alışveriş yaparsınız?"),
          options: [
            L("Less than once a month", "Ayda birden az"),
            L("Approximately once a month", "Yaklaşık ayda bir"),
            L("2–3 times a month", "Ayda 2–3 kez"),
            L("Approximately once a week", "Yaklaşık haftada bir"),
            L("Several times a week", "Haftada birkaç kez"),
          ] },
      ],
    },

    // ----------------------------------- SECTION 3: ACCEPTANCE & COMPLEXITY
    {
      id: "tasks", type: "questions", progress: 3, card: "#f6fff2",
      section: L("Section 3", "Bölüm 3"),
      title: L("Acceptance and Complexity Across Tasks", "Görevlere Göre Kabul ve Karmaşıklık"),
      questions: [
        { id: "Q10", type: "matrix", scale: "willingness",
          text: L("How willing would you be to use an AI-driven chatbot as the first point of contact in each of the following situations?",
                  "Aşağıdaki durumların her birinde, ilk başvuru noktası olarak yapay zekâ destekli bir sohbet botunu kullanmaya ne kadar istekli olurdunuz?"),
          rows: [
            L("Obtaining information about a product", "Bir ürün hakkında bilgi almak"),
            L("Checking the current location of an order", "Bir siparişin güncel konumunu kontrol etmek"),
            L("Starting a product return", "Bir ürün iadesi başlatmak"),
            L("Reporting a package marked as delivered but not received", "Teslim edildi görünen ama ulaşmayan bir paketi bildirmek"),
            L("Disputing an incorrect payment or charge", "Hatalı bir ödemeye veya ücrete itiraz etmek"),
          ] },

        { id: "Q11", type: "matrix", scale: "complexity",
          text: L("Independently of whether the task is handled by a chatbot or a human representative, how complex do you consider each of the following customer-service situations?",
                  "Görevin bir sohbet botu ya da bir temsilci tarafından ele alınmasından bağımsız olarak, aşağıdaki müşteri hizmetleri durumlarının her birini ne kadar karmaşık buluyorsunuz?"),
          rows: [
            L("Obtaining information about a product", "Bir ürün hakkında bilgi almak"),
            L("Checking the current location of an order", "Bir siparişin güncel konumunu kontrol etmek"),
            L("Starting a product return", "Bir ürün iadesi başlatmak"),
            L("Reporting a package marked as delivered but not received", "Teslim edildi görünen ama ulaşmayan bir paketi bildirmek"),
            L("Disputing an incorrect payment or charge", "Hatalı bir ödemeye veya ücrete itiraz etmek"),
          ] },
      ],
    },

    // ------------------------------------------------- SECTION 4: SCENARIO
    {
      id: "scenario", type: "scenario", progress: 4, card: "#eefffb",
      section: L("Section 4", "Bölüm 4"),
      title: L("Customer-Service Scenario", "Müşteri Hizmetleri Senaryosu"),
      intro: L("Imagine that you ordered a product from an online marketplace. The delivery tracking page shows that the package was delivered yesterday, but you have not received it. You open the platform's AI-driven customer-service chatbot. The following conversation takes place:",
               "Bir çevrim içi pazar yerinden bir ürün sipariş ettiğinizi düşünün. Kargo takip sayfası paketin dün teslim edildiğini gösteriyor, ancak siz paketi almadınız. Platformun yapay zekâ destekli müşteri hizmetleri sohbet botunu açıyorsunuz. Aşağıdaki konuşma gerçekleşiyor:"),
      dialogue: [
        { who: "bot", text: L("I can help you with a delivery issue. Is this about order #48271?",
                              "Bir teslimat sorununda size yardımcı olabilirim. Bu, #48271 numaralı siparişle mi ilgili?") },
        { who: "you", text: L("Yes.", "Evet.") },
        { who: "bot", text: L("Please check whether the package was left at your building entrance, reception area, another safe location, or with a neighbour or household member.",
                              "Lütfen paketin bina girişinde, resepsiyon alanında, başka güvenli bir yerde ya da bir komşunuza veya ev halkından birine bırakılıp bırakılmadığını kontrol edin.") },
        { who: "you", text: L("I have already checked all of these places. The package is still missing.",
                              "Tüm bu yerleri zaten kontrol ettim. Paket hâlâ kayıp.") },
        { who: "bot", text: L("Thank you for confirming. I can see that the delivery company marked the order as delivered yesterday, but I cannot confirm where the package was left.",
                              "Teyit ettiğiniz için teşekkürler. Kargo şirketinin siparişi dün teslim edildi olarak işaretlediğini görüyorum, ancak paketin nereye bırakıldığını doğrulayamıyorum.") },
      ],
      versions: {
        A: [
          { who: "bot", text: L("I will now connect you to a customer-service representative.",
                                "Sizi şimdi bir müşteri hizmetleri temsilcisine bağlayacağım.") },
        ],
        B: [
          { who: "bot", text: L("This issue requires further investigation by a customer-service representative. I will connect you to a representative now. Your order details and a summary of this conversation will be transferred automatically, so you will not need to explain the issue again. The estimated waiting time is three minutes.",
                                "Bu sorun, bir müşteri hizmetleri temsilcisi tarafından daha ayrıntılı incelenmeyi gerektiriyor. Sizi şimdi bir temsilciye bağlayacağım. Sipariş bilgileriniz ve bu konuşmanın bir özeti otomatik olarak aktarılacak, böylece sorunu yeniden anlatmanıza gerek kalmayacak. Tahmini bekleme süresi üç dakikadır.") },
        ],
      },
    },

    // ----------------------------------------------- SECTION 5: EVALUATION
    {
      id: "evaluation", type: "questions", progress: 4, card: "#eefffb",
      withScenario: "scenario",
      section: L("Section 4", "Bölüm 4"),
      title: L("Evaluation of the Scenario", "Senaryonun Değerlendirilmesi"),
      questions: [
        { id: "Q12", type: "likert", scale: "agreement",
          text: L("The chatbot clearly explained what would happen next.", "Sohbet botu, bundan sonra ne olacağını açıkça anlattı.") },
        { id: "Q13", type: "likert", scale: "agreement",
          text: L("It was clear whether the information I had already provided would be transferred to the human representative.",
                  "Daha önce verdiğim bilgilerin müşteri temsilcisine aktarılıp aktarılmayacağı açıktı.") },
        { id: "Q14", type: "likert", scale: "agreement",
          text: L("I would expect the human representative to already have the information needed to continue the process.",
                  "Müşteri temsilcisinin, sürece devam etmek için gereken bilgilere zaten sahip olmasını beklerdim.") },
        { id: "Q15", type: "likert", scale: "agreement",
          text: L("The chatbot appeared to understand the nature of the problem.", "Sohbet botu, sorunun niteliğini anlamış görünüyordu.") },
        { id: "Q16", type: "likert", scale: "agreement",
          text: L("The chatbot appeared competent in identifying the appropriate next step.", "Sohbet botu, uygun bir sonraki adımı belirlemede yetkin görünüyordu.") },
        { id: "Q17", type: "likert", scale: "agreement",
          text: L("The chatbot helped move the customer-service process forward.", "Sohbet botu, müşteri hizmetleri sürecini ilerletmeye yardımcı oldu.") },
        { id: "Q18", type: "likert", scale: "agreement",
          text: L("Using this chatbot would reduce the effort required to resolve the issue.", "Bu sohbet botunu kullanmak, sorunu çözmek için gereken çabayı azaltırdı.") },
        { id: "Q19", type: "likert", scale: "agreement",
          text: L("I would accept this chatbot as the first point of contact for customer service.", "Bu sohbet botunu müşteri hizmetlerinde ilk başvuru noktası olarak kabul ederdim.") },
        { id: "Q20", type: "likert", scale: "agreement",
          text: L("I would be willing to continue with the customer-service process presented in this scenario.", "Bu senaryoda sunulan müşteri hizmetleri süreciyle devam etmeye istekli olurdum.") },
        { id: "Q21", type: "likert", scale: "agreement",
          text: L("I would use the same chatbot again for a similar problem.", "Benzer bir sorun için aynı sohbet botunu yeniden kullanırdım.") },
        { id: "Q22", type: "likert", scale: "agreement",
          text: L("I would accept a service process in which a chatbot handles the initial steps before involving a human representative.",
                  "Bir sohbet botunun, bir temsilci devreye girmeden önce ilk adımları üstlendiği bir hizmet sürecini kabul ederdim.") },
        { id: "Q23", type: "likert", scale: "agreement",
          text: L("I would be comfortable with a chatbot handling the entire customer-service process without access to a human representative.",
                  "Bir sohbet botunun, bir temsilciye erişim olmadan tüm müşteri hizmetleri sürecini yürütmesinden rahatsız olmazdım.") },

        { id: "Q24", type: "multiple",
          text: L("After this chatbot interaction, what would you most likely do?", "Bu sohbet botu etkileşiminden sonra büyük olasılıkla ne yapardınız?"),
          options: [
            L("Continue with the transfer to the human representative", "Müşteri temsilcisine aktarımla devam ederdim"),
            L("Try to reach a human representative directly", "Doğrudan bir temsilciye ulaşmaya çalışırdım"),
            L("Restart the chatbot conversation", "Sohbet botu konuşmasını yeniden başlatırdım"),
            L("Use another customer-service channel", "Başka bir müşteri hizmetleri kanalını kullanırdım"),
            L("Leave the process without continuing", "Süreci devam ettirmeden bırakırdım"),
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
        { id: "Q25", type: "single",
          text: L("What is your age group?", "Yaş grubunuz nedir?"),
          options: [
            L("18–24", "18–24"), L("25–34", "25–34"), L("35–44", "35–44"),
            L("45–54", "45–54"), L("55–64", "55–64"),
            L("65 or older", "65 ve üzeri"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q26", type: "single",
          text: L("What is the highest level of education you have completed?", "Tamamladığınız en yüksek eğitim düzeyi nedir?"),
          options: [
            L("Primary school", "İlkokul"), L("Secondary school", "Ortaokul"), L("High school", "Lise"),
            L("Associate degree", "Ön lisans"), L("Bachelor's degree", "Lisans"),
            L("Master's degree", "Yüksek lisans"), L("Doctoral degree", "Doktora"),
            L("Other", "Diğer"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q27", type: "single",
          text: L("What is your gender?", "Cinsiyetiniz nedir?"),
          options: [
            L("Female", "Kadın"), L("Male", "Erkek"), L("Non-binary", "İkili olmayan (non-binary)"),
            L("Prefer to self-describe", "Kendim tanımlamak isterim"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },
      ],
    },

    // -------------------------------------------------------- THANK YOU
    {
      id: "thanks", type: "thanks", progress: 5, card: "#f0faff",
      title: L("Thank you so much\nfor your participation!", "Katılımınız için\nçok teşekkürler!"),
      body: L("Your responses contribute to research on consumer acceptance of AI-driven customer service in e-commerce.",
              "Yanıtlarınız, e-ticarette yapay zekâ destekli müşteri hizmetlerinin tüketici tarafından kabulü üzerine yapılan araştırmaya katkıda bulunur."),
    },
  ],
};
