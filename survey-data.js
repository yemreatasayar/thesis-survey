/* =============================================================================
   SURVEY CONTENT — bilingual (EN / TR). Edit everything here.
   -----------------------------------------------------------------------------
   Every participant-facing string is L("English", "Türkçe").
   Answers are stored by option INDEX (single/binary) or value (likert/matrix),
   so the language toggle never affects given answers.
   1–7 scales show only the two endpoint anchors.

   Source: revised questionnaire (19 Qs) — ENG "...Revized 25.06.2026.docx"
   + TR "Yapay Zeka Destekli Müşteri Hizmetleri Anketi.docx".
   Display number prefix: "Q" in English, "S" in Turkish (handled in app.js).

   EXPERIMENT: between-subjects, two conditions — "standard" / "lossless".
   The participant sees only the assigned condition. Condition labels (Standard
   Handoff / Lossless Handoff) are NEVER shown. Assignment happens after Q8.
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
    otherPlaceholder: L("Please specify (optional)", "Lütfen belirtin (isteğe bağlı)"),

    // comprehension gate
    reviewProcess:  L("Review the service process", "Hizmet sürecini incele"),
    processHeading: L("How the service process works", "Hizmet süreci nasıl işliyor"),
    ifChatbot:      L("If you choose the chatbot:", "Chatbotu seçerseniz:"),
    correctionHeading: L("Please review the service process", "Lütfen hizmet sürecini dikkatlice yeniden inceleyin"),

    confirmTitle: L("Are you sure?", "Emin misiniz?"),
    confirmBody:  L("Once you send, your responses are submitted and cannot be changed.",
                    "Gönderdikten sonra yanıtlarınız iletilir ve değiştirilemez."),
    confirmYes:   L("YES, SEND", "EVET, GÖNDER"),
    confirmNo:    L("GO BACK", "GERİ DÖN"),
    endedTitle: L("Thank you for your interest", "İlginiz için teşekkürler"),
    endedBody:  L("Based on your response, this survey is not applicable to you. You may now close this page. No data has been collected.",
                  "Verdiğiniz yanıt doğrultusunda bu anket size uygun değildir. Bu sayfayı kapatabilirsiniz. Hiçbir veri toplanmamıştır."),
    doneTitle: L("You have already completed this survey", "Bu anketi zaten tamamladınız"),
    doneBody:  L("Thank you — your responses have already been recorded. You may now close this page.",
                 "Teşekkürler — yanıtlarınız daha önce kaydedildi. Bu sayfayı kapatabilirsiniz."),
    sending: L("Sending your responses…", "Yanıtlarınız gönderiliyor…"),
    ok:      L("✓ Your responses were recorded. You may close this page.", "✓ Yanıtlarınız kaydedildi. Bu sayfayı kapatabilirsiniz."),
    err:     L("Could not send your responses. Please check your connection — your answers are kept on this page.",
               "Yanıtlarınız gönderilemedi. Lütfen bağlantınızı kontrol edin — cevaplarınız bu sayfada saklanıyor."),
  },

  // 1–7 scale — three reference anchors (1 / 4 / 7)
  scales: {
    agreement: { low: L("Strongly disagree", "Kesinlikle katılmıyorum"),
                 mid: L("Neither agree nor disagree", "Ne katılıyorum ne katılmıyorum"),
                 high: L("Strongly agree", "Kesinlikle katılıyorum") },
  },

  // Final confirmation shown after a second incorrect comprehension attempt
  finalConfirm: L("I understand when the waiting time for a human representative begins and what happens to the information provided to the chatbot.",
                  "Yukarıdaki açıklamayı okudum ve müşteri temsilcisini bekleme süresinin ne zaman başladığını ve chatbota verilen bilgilere ne olduğunu anladım."),

  // Condition-specific correction messages (shown when comprehension is wrong)
  corrections: {
    standard: [
      L("In this scenario, the human-representative queue begins only after the chatbot has failed to resolve the problem. The estimated 10-minute waiting time therefore begins after the chatbot interaction.",
        "Bu senaryoda müşteri temsilcisi kuyruğuna yalnızca chatbot sorununuzu çözemedikten sonra girersiniz. Bu nedenle müşteri temsilcisi için tahmini 10 dakikalık bekleme süresi chatbot görüşmesinden sonra başlar."),
      L("You may also need to provide some of the information again when continuing with the human representative.",
        "Müşteri temsilcisiyle devam ederken bazı bilgileri yeniden vermeniz gerekebilir."),
    ],
    lossless: [
      L("In this scenario, the chatbot interaction and the human-representative waiting time begin at the same time. The estimated waiting time continues in the background while you use the chatbot.",
        "Bu senaryoda chatbot görüşmesi ile müşteri temsilcisini bekleme süresi aynı anda başlar. Siz chatbotu kullanırken tahmini bekleme süresi arka planda devam eder."),
      L("If the chatbot cannot resolve the problem, your information is transferred to the representative, so you do not need to explain the problem again.",
        "Chatbot sorununuzu çözemezse verdiğiniz bilgiler müşteri temsilcisine aktarılır. Bu nedenle sorununuzu yeniden anlatmanız gerekmez."),
    ],
  },

  sections: [
    // ---------------------------------------------------------------- INTRO
    {
      id: "intro", type: "intro", progress: 0, card: "#ffffee",
      title: L("Participant Information", "Katılımcı Bilgilendirmesi"),
      body: [
        L("This survey is part of a Master's thesis examining consumer decision-making in AI-driven customer service. The survey takes approximately 5 to 7 minutes.",
          "Bu anket, yapay zekâ destekli müşteri hizmetlerinde tüketicilerin karar verme süreçlerini inceleyen bir yüksek lisans tezinin parçasıdır. Anketin tamamlanması yaklaşık 5 ila 7 dakika sürmektedir."),
        L("Participation is voluntary and anonymous. No personally identifiable information will be collected. You may leave the survey at any time without providing a reason.",
          "Katılımınız tamamen gönüllüdür ve yanıtlarınız anonim olarak kaydedilecektir. Kimliğinizi belirleyebilecek herhangi bir kişisel bilgi toplanmayacaktır. Dilediğiniz zaman herhangi bir gerekçe göstermeden anketten ayrılabilirsiniz."),
        L("In this survey, a customer-service chatbot refers to an automated, text-based system that communicates with customers and assists with service-related requests.",
          "Bu ankette \"müşteri hizmetleri chatbotu\", müşterilerle yazılı olarak iletişim kuran ve müşteri hizmetleriyle ilgili taleplere yardımcı olan otomatik bir sistemi ifade etmektedir."),
      ],
    },

    // ------------------------------------------------------ SECTION 1: CONSENT
    {
      id: "consent", type: "questions", progress: 1, card: "#e9fffe", group: true,
      section: L("Section 1", "Bölüm 1"),
      title: L("Consent and Eligibility", "Onay ve Katılım Koşulları"),
      questions: [
        { id: "Q1", type: "binary", endIfNo: true,
          text: L("I confirm that I am at least 18 years old and voluntarily agree to participate in this study.",
                  "18 yaşında veya daha büyük olduğumu ve bu araştırmaya gönüllü olarak katılmayı kabul ettiğimi onaylıyorum.") },
        { id: "Q2", type: "binary", endIfNo: true,
          text: L("Do you currently live in Turkey?", "Şu anda Türkiye'de mi yaşıyorsunuz?") },
        { id: "Q3", type: "binary", endIfNo: true,
          text: L("Have you purchased a product or service online within the last six months?",
                  "Son altı ay içinde internet üzerinden bir ürün veya hizmet satın aldınız mı?") },
      ],
    },

    // -------------------------------------------------- SECTION 2: EXPERIENCE
    {
      id: "experience", type: "questions", progress: 2, card: "#f0faff",
      section: L("Section 2", "Bölüm 2"),
      title: L("Previous Experience", "Önceki Deneyimler"),
      questions: [
        { id: "Q4", type: "single", skipIfFirst: ["Q5"],
          text: L("How many times have you used a customer-service chatbot during the last 12 months?",
                  "Son 12 ay içinde müşteri hizmetleri amacıyla kaç kez chatbot kullandınız?"),
          options: [
            L("Never", "Hiç kullanmadım"),
            L("Once", "Bir kez"),
            L("2 to 3 times", "2 ila 3 kez"),
            L("4 to 6 times", "4 ila 6 kez"),
            L("7 or more times", "7 kez veya daha fazla"),
          ] },

        { id: "Q5", type: "single",
          text: L("During your previous customer-service chatbot interactions, were you ever transferred to a human representative?",
                  "Daha önceki müşteri hizmetleri chatbot görüşmeleriniz sırasında bir müşteri temsilcisine aktarıldığınız oldu mu?"),
          options: [
            L("No, I was never transferred", "Hayır, daha önce bir müşteri temsilcisine aktarılmadım"),
            L("Yes, and the information I had provided was transferred to the representative",
              "Evet, verdiğim bilgiler müşteri temsilcisine aktarıldı"),
            L("Yes, but I had to explain the issue again", "Evet, ancak sorunu müşteri temsilcisine yeniden anlatmak zorunda kaldım"),
            L("Yes, but I do not remember whether the information was transferred",
              "Evet, ancak verdiğim bilgilerin aktarılıp aktarılmadığını hatırlamıyorum"),
            L("I do not remember", "Hatırlamıyorum"),
          ] },

        { id: "Q6", type: "single", otherText: true,
          text: L("Which customer-service channel would you normally prefer as your first option?",
                  "Müşteri hizmetlerine ulaşmanız gerektiğinde ilk olarak genellikle hangi kanalı tercih edersiniz?"),
          options: [
            L("AI-driven chatbot", "Yapay zekâ destekli chatbot"),
            L("Live chat with a human representative", "Bir müşteri temsilcisiyle canlı yazışma"),
            L("Telephone", "Telefon"),
            L("Email", "E-posta"),
            L("Social media or messaging application", "Sosyal medya veya mesajlaşma uygulaması"),
            L("I have no specific preference", "Belirli bir tercihim yok"),
            L("Other", "Diğer"),
          ] },

        { id: "Q7", type: "single",
          text: L("How often do you shop online?", "Ne sıklıkla internetten alışveriş yaparsınız?"),
          options: [
            L("Less than once a month", "Ayda bir kereden daha az"),
            L("Approximately once a month", "Yaklaşık ayda bir kez"),
            L("2 to 3 times a month", "Ayda 2 ila 3 kez"),
            L("Approximately once a week", "Yaklaşık haftada bir kez"),
            L("Several times a week", "Haftada birkaç kez"),
          ] },
      ],
    },

    // ------------------------ SECTION 3: GENERAL CHATBOT EVALUATION (Q8)
    {
      id: "general", type: "questions", progress: 3, card: "#f6fff2",
      section: L("Section 3", "Bölüm 3"),
      title: L("General Evaluation of Customer-Service Chatbots",
               "Müşteri Hizmetleri Chatbotlarına İlişkin Genel Değerlendirme"),
      questions: [
        { id: "Q8", type: "matrix", scale: "agreement", keys: ["q8_1", "q8_2", "q8_3"],
          text: L("Please indicate how much you agree or disagree with each statement.",
                  "Lütfen aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("Customer-service chatbots are generally reliable.",
              "Müşteri hizmetleri chatbotları genel olarak güvenilirdir."),
            L("Customer-service chatbots can provide useful assistance.",
              "Müşteri hizmetleri chatbotları faydalı destek sağlayabilir."),
            L("Customer-service chatbots are capable of handling routine customer-service problems.",
              "Müşteri hizmetleri chatbotları rutin müşteri hizmetleri sorunlarını çözebilecek yeterliliğe sahiptir."),
          ] },
      ],
    },

    // ------------------------------------------------- SECTION 4: SCENARIO
    // Condition is assigned (standard / lossless) on first reaching this screen.
    {
      id: "scenario", type: "scenario", progress: 4, card: "#eefffb",
      section: L("Section 4", "Bölüm 4"),
      title: L("Customer-Service Scenario", "Müşteri Hizmetleri Senaryosu"),
      common: [
        L("Imagine that you ordered a moderately priced pair of wireless headphones from an online marketplace. The delivery tracking page shows that the package was delivered yesterday, but you have not received it.",
          "Ortalama fiyata sahip bir kablosuz kulaklığı, bir çevrim içi alışveriş platformundan sipariş ettiğinizi düşünün. Kargo takip sayfasında paketin dün teslim edildiği görünüyor, ancak paket size ulaşmadı."),
        L("You have already checked your building entrance, reception area, safe locations, and asked your neighbours and household members. The package is still missing.",
          "Bina girişini, resepsiyonu ve paketin bırakılmış olabileceği diğer güvenli alanları kontrol ettiniz. Ayrıca komşularınıza ve birlikte yaşadığınız kişilere sordunuz. Buna rağmen paketi bulamadınız."),
        L("You open the marketplace's customer-service page. An AI-driven customer-service chatbot is available immediately. A human customer-service representative is available after an estimated waiting time of 10 minutes. The chatbot can access the order information and attempt to assist with delivery-related problems, although it may not be able to resolve every case.",
          "Alışveriş platformunun müşteri hizmetleri sayfasını açıyorsunuz. Yapay zekâ destekli müşteri hizmetleri chatbotu hemen kullanılabilir durumda. Bir müşteri temsilcisine ulaşmak içinse tahmini bekleme süresi 10 dakikadır. Chatbot sipariş bilgilerinize erişebilir ve teslimatla ilgili sorununuza yardımcı olmaya çalışabilir. Ancak her sorunu çözmesi mümkün olmayabilir."),
        L("Before selecting a service channel, the platform provides the following information.",
          "Bir müşteri hizmetleri kanalı seçmeden önce platform size aşağıdaki bilgileri gösteriyor."),
      ],
      note: L("Please read the following service process carefully. You will answer two short questions about how the process works before continuing.",
              "Lütfen aşağıdaki hizmet sürecini dikkatlice okuyun. Devam etmeden önce sürecin nasıl işlediğine ilişkin iki kısa soruyu yanıtlayacaksınız."),
      conditions: {
        standard: {
          steps: [
            L("You start using the chatbot immediately.", "Chatbotu hemen kullanmaya başlarsınız."),
            L("You are not yet in the queue for a human representative.", "Bu sırada henüz müşteri temsilcisi kuyruğuna girmiş olmazsınız."),
            L("If the chatbot cannot resolve your problem, you then enter the queue for a human representative.",
              "Chatbot sorununuzu çözemezse daha sonra müşteri temsilcisi kuyruğuna girersiniz."),
            L("From that point, the estimated waiting time for a human representative is 10 minutes.",
              "Müşteri temsilcisine ulaşmak için tahmini 10 dakikalık bekleme süresi o andan itibaren başlar."),
            L("You may need to provide some of the information again.", "Verdiğiniz bazı bilgileri müşteri temsilcisine yeniden iletmeniz gerekebilir."),
          ],
          summary: L("In other words, the chatbot interaction and the human waiting time happen one after the other.",
                     "Başka bir ifadeyle, chatbot görüşmesi ile müşteri temsilcisini bekleme süreci art arda gerçekleşir."),
          arrow: L("Chatbot interaction → 10-minute human wait → Human representative if needed.",
                   "Chatbot görüşmesi → 10 dakika müşteri temsilcisini bekleme → Gerektiğinde müşteri temsilcisi"),
        },
        lossless: {
          steps: [
            L("You start using the chatbot immediately.", "Chatbotu hemen kullanmaya başlarsınız."),
            L("At the same time, you also enter the queue for a human representative.", "Aynı anda müşteri temsilcisi kuyruğuna da girersiniz."),
            L("The estimated 10-minute waiting time continues in the background while you use the chatbot.",
              "Chatbotu kullanırken tahmini 10 dakikalık bekleme süresi arka planda devam eder."),
            L("If the chatbot cannot resolve your problem, you keep your current position in the queue.",
              "Chatbot sorununuzu çözemezse müşteri temsilcisi kuyruğundaki mevcut sıranızı korursunuz."),
            L("The information you provided is transferred to the representative, so you do not need to explain the problem again.",
              "Chatbota verdiğiniz bilgiler müşteri temsilcisine aktarılır. Bu nedenle sorununuzu yeniden anlatmanız gerekmez."),
          ],
          summary: L("In other words, the chatbot interaction and the human waiting time happen at the same time.",
                     "Başka bir ifadeyle, chatbot görüşmesi ile müşteri temsilcisini bekleme süreci aynı anda gerçekleşir."),
          arrow: L("Chatbot interaction and 10-minute human wait begin simultaneously → Human representative if needed.",
                   "Chatbot görüşmesi ve 10 dakikalık bekleme aynı anda başlar → Gerektiğinde müşteri temsilcisi"),
        },
      },
    },

    // -------------------------------- SECTION 5: COMPREHENSION GATE (Q9, Q10)
    {
      id: "comprehension", type: "comprehension", progress: 4, card: "#eefffb",
      section: L("Section 5", "Bölüm 5"),
      title: L("Understanding of the Service Process", "Hizmet Sürecinin Anlaşılması"),
      instruction: L("Before continuing, please answer the following questions based on the service process you have just read.",
                     "Devam etmeden önce, okuduğunuz hizmet sürecine göre aşağıdaki soruları yanıtlayın."),
      questions: [
        { id: "Q9", type: "single",
          correct: { standard: 1, lossless: 0 },
          text: L("If you started with the chatbot and the chatbot could not resolve the problem, when would the 10-minute waiting time for a human representative begin?",
                  "Chatbotu kullanmaya başladığınızı ve chatbotun sorununuzu çözemediğini düşünün. Müşteri temsilcisi için 10 dakikalık bekleme süresi ne zaman başlar?"),
          options: [
            L("At the same time as the chatbot interaction begins", "Chatbot görüşmesi başladığı anda"),
            L("Only after the chatbot interaction ends without resolving the problem", "Chatbot görüşmesi sorunu çözemeden sona erdikten sonra"),
            L("There would be no waiting time for a human representative", "Müşteri temsilcisi için herhangi bir bekleme süresi olmaz"),
            L("I am not sure", "Emin değilim"),
          ] },
        { id: "Q10", type: "single",
          correct: { standard: 1, lossless: 0 },
          text: L("According to the service process described, which statement is correct about the information you provided to the chatbot if you continued with a human representative?",
                  "Açıklanan hizmet sürecine göre, müşteri temsilcisiyle devam etmeniz hâlinde chatbota verdiğiniz bilgilerle ilgili aşağıdaki ifadelerden hangisi doğrudur?"),
          options: [
            L("It would be transferred, so I would not need to explain the problem again", "Bilgiler müşteri temsilcisine aktarılır ve sorunu yeniden anlatmam gerekmez"),
            L("I might need to provide some of the information again", "Bazı bilgileri müşteri temsilcisine yeniden vermem gerekebilir"),
            L("All information would be deleted", "Verdiğim tüm bilgiler silinir"),
            L("I am not sure", "Emin değilim"),
          ] },
      ],
    },

    // ----------------------------- SECTION 6: IMMEDIATE CHANNEL CHOICE (Q11)
    {
      id: "choice", type: "questions", progress: 5, card: "#fff9f0", lockBefore: true,
      section: L("Section 6", "Bölüm 6"),
      title: L("Immediate Channel Choice", "Kanal Seçimi"),
      questions: [
        { id: "Q11", type: "single",
          text: L("Based on the information provided, which option would you choose?",
                  "Verilen bilgilere göre hangi seçeneği tercih ederdiniz?"),
          options: [
            L("Start with the AI-driven chatbot immediately", "Yapay zekâ destekli chatbotu hemen kullanmaya başlamak"),
            L("Wait approximately 10 minutes for a human representative", "Bir müşteri temsilcisine ulaşmak için yaklaşık 10 dakika beklemek"),
          ] },
      ],
    },

    // -------------------------- SECTION 7: PERCEIVED FAILURE COST (Q12)
    {
      id: "failurecost", type: "questions", progress: 5, card: "#f3f7ff",
      section: L("Section 7", "Bölüm 7"),
      title: L("Perceived Cost of Chatbot Failure", "Chatbotun Başarısız Olmasının Algılanan Maliyeti"),
      questions: [
        { id: "Q12", type: "matrix", scale: "agreement", randomize: true,
          keys: ["q12_1", "q12_2", "q12_3", "q12_4"],
          text: L("Thinking about the service process described above, please indicate how much you agree or disagree with each statement.",
                  "Yukarıda açıklanan hizmet sürecini düşünerek aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("Trying the chatbot first could increase the total time needed to resolve my problem.",
              "Önce chatbotu denemek, sorunumun çözülmesi için gereken toplam süreyi artırabilir."),
            L("If the chatbot could not resolve the problem, I would need to spend additional effort.",
              "Chatbot sorunu çözemezse ek çaba harcamam gerekebilir."),
            L("If I were transferred to a human representative, I might need to provide the same information again.",
              "Bir müşteri temsilcisine aktarılırsam aynı bilgileri yeniden vermem gerekebilir."),
            L("Starting with the chatbot could delay my access to a human representative.",
              "Chatbotla başlamak, bir müşteri temsilcisine ulaşmamı geciktirebilir."),
          ] },
      ],
    },

    // ----------------------- SECTION 8: WILLINGNESS TO BEGIN (Q13)
    {
      id: "willingness", type: "questions", progress: 5, card: "#f6fff2",
      section: L("Section 8", "Bölüm 8"),
      title: L("Willingness to Begin with the Chatbot", "Chatbotla Başlama İsteği"),
      questions: [
        { id: "Q13", type: "matrix", scale: "agreement", keys: ["q13_1", "q13_2", "q13_3"],
          text: L("Please indicate how much you agree or disagree with each statement.",
                  "Lütfen aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("I would be willing to start with the chatbot in this situation.",
              "Bu durumda chatbotu kullanmaya başlamak isterdim."),
            L("I would prefer to try the chatbot before waiting for a human representative.",
              "Bir müşteri temsilcisini beklemeden önce chatbotu denemeyi tercih ederdim."),
            L("Trying the chatbot first would be a reasonable choice in this situation.",
              "Bu durumda önce chatbotu denemek mantıklı bir seçim olurdu."),
          ] },
      ],
    },

    // ---------------------- SECTION 9: EVALUATION OF THE CHATBOT (Q14, Q15)
    {
      id: "evaluation", type: "questions", progress: 5, card: "#eefffb",
      section: L("Section 9", "Bölüm 9"),
      title: L("Evaluation of the Chatbot", "Chatbotun Değerlendirilmesi"),
      questions: [
        { id: "Q14", type: "matrix", scale: "agreement", keys: ["q14_1", "q14_2"],
          text: L("Please indicate how much you agree or disagree with each statement.",
                  "Lütfen aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("The chatbot appears capable of handling this type of problem.",
              "Chatbot bu tür bir sorunla ilgilenebilecek yeterliliğe sahip görünüyor."),
            L("The chatbot would probably identify an appropriate next step.",
              "Chatbotun uygun bir sonraki adımı belirleyebileceğini düşünüyorum."),
          ] },
        { id: "Q15", type: "matrix", scale: "agreement", keys: ["q15_1", "q15_2"],
          text: L("Please indicate how much you agree or disagree with each statement.",
                  "Lütfen aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("I would trust the chatbot to handle the initial stage of this request appropriately.",
              "Talebimin ilk aşamasını uygun şekilde yönetmesi konusunda chatbota güvenirdim."),
            L("I would feel confident that the chatbot would use the information I provide correctly.",
              "Chatbotun verdiğim bilgileri doğru şekilde kullanacağına güvenirdim."),
          ] },
      ],
    },

    // ---------------------- SECTION 10: PROCESS CREDIBILITY (Q16)
    {
      id: "credibility", type: "questions", progress: 5, card: "#f0faff",
      section: L("Section 10", "Bölüm 10"),
      title: L("Credibility of the Described Process", "Açıklanan Hizmet Sürecinin İnandırıcılığı"),
      questions: [
        { id: "Q16", type: "matrix", scale: "agreement", keys: ["q16_1", "q16_2"],
          text: L("Please indicate how much you agree or disagree with each statement.",
                  "Lütfen aşağıdaki ifadelere ne ölçüde katıldığınızı belirtin."),
          rows: [
            L("The customer-service process described in the scenario seems realistic.",
              "Senaryoda açıklanan müşteri hizmetleri süreci gerçekçi görünüyor."),
            L("I believe the platform would follow the handoff process as described.",
              "Platformun aktarım sürecini açıklandığı şekilde uygulayacağına inanıyorum."),
          ] },
      ],
    },

    // -------------------------------------------- SECTION 11: DEMOGRAPHICS
    {
      id: "demographics", type: "questions", progress: 6, card: "#fffaf5",
      section: L("Section 11", "Bölüm 11"),
      title: L("Demographic Information", "Demografik Bilgiler"),
      questions: [
        { id: "Q17", type: "single",
          text: L("What is your age group?", "Yaş grubunuz nedir?"),
          options: [
            L("18-24", "18-24"), L("25-34", "25-34"), L("35-44", "35-44"),
            L("45-54", "45-54"), L("55-64", "55-64"),
            L("65 or older", "65 veya üzeri"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q18", type: "single",
          text: L("What is the highest level of education you have completed?", "Tamamladığınız en yüksek eğitim düzeyi nedir?"),
          options: [
            L("Primary school", "İlkokul"), L("Secondary school", "Ortaokul"), L("High school", "Lise"),
            L("Associate degree", "Ön lisans"), L("Bachelor's degree", "Lisans"),
            L("Master's degree", "Yüksek lisans"), L("Doctoral degree", "Doktora"),
            L("Other", "Diğer"), L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },

        { id: "Q19", type: "single", otherText: true, otherIndex: 3,
          text: L("What is your gender?", "Cinsiyetiniz nedir?"),
          options: [
            L("Female", "Kadın"), L("Male", "Erkek"),
            L("Non-binary", "İkili cinsiyet sınıflandırmasının dışında"),
            L("Prefer to self-describe", "Kendim belirtmek istiyorum"),
            L("Prefer not to say", "Belirtmek istemiyorum"),
          ] },
      ],
    },

    // -------------------------------------------------------- THANK YOU
    {
      id: "thanks", type: "thanks", progress: 6, card: "#f0faff",
      title: L("Thank you\nfor participating!", "Katılımınız için\nteşekkür ederiz!"),
      body: L("Your responses will contribute to research on consumer acceptance of AI-driven customer service and the design of transitions between chatbots and human representatives.",
              "Yanıtlarınız, yapay zekâ destekli müşteri hizmetlerinin tüketiciler tarafından kabulü ve chatbotlardan müşteri temsilcilerine geçiş süreçlerinin tasarımı üzerine yürütülen araştırmaya katkı sağlayacaktır."),
    },
  ],
};
