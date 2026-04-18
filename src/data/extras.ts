export type PhraseSection = {
  icon: string;
  title: string;
  items: Array<{
    gr: string;
    en: string;
    note?: string;
  }>;
};

export type MatchLesson = {
  id: string;
  label: string;
  notes: string;
  tenses: Record<"present" | "past" | "future", string[]>;
};

export const phraseSections: PhraseSection[] = [
  {
    icon: "🍽️",
    title: "Restaurant & Cafe",
    items: [
      { gr: "Θέλω να κλείσω ένα τραπέζι.", en: "I'd like to book a table." },
      { gr: "Για πόσα άτομα;", en: "For how many people?", note: "staff asks" },
      { gr: "Για δύο άτομα, παρακαλώ.", en: "For two people, please." },
      { gr: "Τον κατάλογο, παρακαλώ.", en: "The menu, please." },
      { gr: "Θα πάρω...", en: "I'll have..." },
      { gr: "Τι μου προτείνετε;", en: "What do you recommend?" },
      { gr: "Χωρίς κρεμμύδι, παρακαλώ.", en: "Without onion, please." },
      { gr: "Είμαι χορτοφάγος.", en: "I am vegetarian." },
      { gr: "Τον λογαριασμό, παρακαλώ.", en: "The bill, please." },
      { gr: "Πληρώνω με κάρτα.", en: "I'm paying by card." },
      { gr: "Ήταν πολύ νόστιμο!", en: "It was very tasty!" },
      { gr: "Ένα νερό χωρίς ανθρακικό, παρακαλώ.", en: "A still water, please." },
    ],
  },
  {
    icon: "✈️",
    title: "Travel & Transport",
    items: [
      { gr: "Πού είναι η στάση του λεωφορείου;", en: "Where is the bus stop?" },
      { gr: "Ένα εισιτήριο, παρακαλώ.", en: "One ticket, please." },
      { gr: "Πότε φεύγει το τρένο;", en: "When does the train leave?" },
      { gr: "Σε ποια στάση κατεβαίνω;", en: "At which stop do I get off?" },
      { gr: "Χάθηκα. Μπορείτε να με βοηθήσετε;", en: "I'm lost. Can you help me?" },
      { gr: "Έχετε δωμάτια ελεύθερα;", en: "Do you have free rooms?" },
      { gr: "Θέλω ένα δωμάτιο για δύο.", en: "I'd like a room for two." },
      { gr: "Πού είναι το κέντρο;", en: "Where is the town centre?" },
      { gr: "Τι ώρα είναι το check-in;", en: "What time is check-in?" },
      { gr: "Θέλω να πάω στο αεροδρόμιο.", en: "I want to go to the airport." },
      { gr: "Είναι μακριά από εδώ;", en: "Is it far from here?" },
      { gr: "Μπορώ να βγάλω φωτογραφία εδώ;", en: "Can I take a photo here?" },
    ],
  },
  {
    icon: "🏥",
    title: "Doctor & Pharmacy",
    items: [
      { gr: "Δεν αισθάνομαι καλά.", en: "I don't feel well." },
      { gr: "Έχω πυρετό.", en: "I have a fever." },
      { gr: "Έχω πονοκέφαλο.", en: "I have a headache." },
      { gr: "Με πονάει εδώ.", en: "It hurts here.", note: "while pointing" },
      { gr: "Χρειάζομαι γιατρό.", en: "I need a doctor." },
      { gr: "Θέλω να κλείσω ραντεβού.", en: "I want to make an appointment." },
      { gr: "Είμαι αλλεργικός σε...", en: "I am allergic to..." },
      { gr: "Πού είναι το φαρμακείο;", en: "Where is the pharmacy?" },
      { gr: "Παίρνω φάρμακα.", en: "I am taking medication." },
      { gr: "Έχω κρυολόγημα.", en: "I have a cold." },
      { gr: "Πονάει ο λαιμός μου.", en: "My throat hurts." },
      { gr: "Περαστικά!", en: "Get well soon!" },
    ],
  },
  {
    icon: "🏠",
    title: "Home & Daily Life",
    items: [
      { gr: "Μένω σε διαμέρισμα.", en: "I live in an apartment." },
      { gr: "Το σπίτι μου είναι κοντά στο κέντρο.", en: "My house is near the centre." },
      { gr: "Καθαρίζω το σπίτι κάθε Σάββατο.", en: "I clean the house every Saturday." },
      { gr: "Πλένω τα ρούχα το βράδυ.", en: "I wash the clothes in the evening." },
      { gr: "Μαγειρεύω στο σπίτι σχεδόν κάθε μέρα.", en: "I cook at home almost every day." },
      { gr: "Το δωμάτιό μου είναι μικρό αλλά άνετο.", en: "My room is small but comfortable." },
      { gr: "Χρειάζομαι καινούριο ψυγείο.", en: "I need a new fridge." },
      { gr: "Ανοίξτε το παράθυρο, παρακαλώ.", en: "Open the window, please." },
      { gr: "Το πλυντήριο δεν δουλεύει.", en: "The washing machine is not working." },
      { gr: "Θα μείνω σπίτι απόψε.", en: "I will stay home tonight." },
    ],
  },
  {
    icon: "🛍️",
    title: "Shopping & Services",
    items: [
      { gr: "Πόσο κοστίζει αυτό;", en: "How much does this cost?" },
      { gr: "Είναι πολύ ακριβό.", en: "It is very expensive." },
      { gr: "Έχετε κάτι πιο φτηνό;", en: "Do you have something cheaper?" },
      { gr: "Θέλω να το δοκιμάσω.", en: "I want to try it on." },
      { gr: "Έχετε άλλο μέγεθος;", en: "Do you have another size?" },
      { gr: "Θα το πάρω.", en: "I'll take it." },
      { gr: "Μπορώ να πληρώσω με μετρητά;", en: "Can I pay in cash?" },
      { gr: "Χρειάζομαι απόδειξη.", en: "I need a receipt." },
      { gr: "Το κατάστημα κλείνει στις οκτώ.", en: "The shop closes at eight." },
      { gr: "Πού είναι το ταχυδρομείο;", en: "Where is the post office?" },
    ],
  },
  {
    icon: "👋",
    title: "Meeting People",
    items: [
      { gr: "Χάρηκα πολύ.", en: "Nice to meet you." },
      { gr: "Από πού είστε;", en: "Where are you from?" },
      { gr: "Πώς σας λένε;", en: "What is your name?" },
      { gr: "Μένω στην Κύπρο εδώ και τρία χρόνια.", en: "I have been living in Cyprus for three years." },
      { gr: "Εργάζομαι ως δάσκαλος.", en: "I work as a teacher." },
      { gr: "Είμαι παντρεμένος.", en: "I am married." },
      { gr: "Έχω δύο παιδιά.", en: "I have two children." },
      { gr: "Μιλάω λίγα ελληνικά.", en: "I speak a little Greek." },
      { gr: "Μπορείτε να μιλάτε πιο αργά;", en: "Can you speak more slowly?" },
      { gr: "Μαθαίνω ελληνικά για την εξέταση.", en: "I am learning Greek for the exam." },
    ],
  },
  {
    icon: "🧭",
    title: "Directions & Places",
    items: [
      { gr: "Πού είναι η τράπεζα;", en: "Where is the bank?" },
      { gr: "Πηγαίνετε ευθεία.", en: "Go straight ahead." },
      { gr: "Στρίψτε δεξιά στο φανάρι.", en: "Turn right at the traffic light." },
      { gr: "Στρίψτε αριστερά στη γωνία.", en: "Turn left at the corner." },
      { gr: "Είναι δίπλα στο σούπερ μάρκετ.", en: "It is next to the supermarket." },
      { gr: "Είναι απέναντι από την εκκλησία.", en: "It is opposite the church." },
      { gr: "Είναι κοντά ή μακριά;", en: "Is it near or far?" },
      { gr: "Παίρνω το πρώτο δρόμο δεξιά.", en: "I take the first road on the right." },
      { gr: "Το νοσοκομείο είναι πίσω από το πάρκο.", en: "The hospital is behind the park." },
      { gr: "Μπορείτε να μου δείξετε στον χάρτη;", en: "Can you show me on the map?" },
    ],
  },
  {
    icon: "💬",
    title: "Everyday Expressions",
    items: [
      { gr: "Κατά τη γνώμη μου...", en: "In my opinion..." },
      { gr: "Νομίζω ότι...", en: "I think that..." },
      { gr: "Μου αρέσει να...", en: "I like to..." },
      { gr: "Δεν καταλαβαίνω.", en: "I don't understand." },
      { gr: "Πού είναι...;", en: "Where is...?" },
      { gr: "Θα ήθελα...", en: "I would like..." },
      { gr: "Δεν πειράζει.", en: "It doesn't matter." },
      { gr: "Καλό ταξίδι!", en: "Have a good trip!" },
      { gr: "Στην υγειά σας!", en: "Cheers!" },
      { gr: "Τι να σου πω;", en: "What can I tell you?" },
      { gr: "Για παράδειγμα...", en: "For example..." },
      { gr: "Συνήθως ξυπνάω νωρίς.", en: "I usually wake up early." },
    ],
  },
  {
    icon: "📞",
    title: "Phone & Appointments",
    items: [
      { gr: "Παρακαλώ;", en: "Hello? (answering phone)", note: "standard phone greeting" },
      { gr: "Ποιος είναι;", en: "Who is it?" },
      { gr: "Θέλω να κλείσω ραντεβού.", en: "I want to make an appointment." },
      { gr: "Για πότε θέλετε;", en: "For when do you want it?", note: "staff asks" },
      { gr: "Μπορείτε να με πάρετε αργότερα;", en: "Can you call me later?" },
      { gr: "Θα σας καλέσω ξανά αύριο.", en: "I will call you again tomorrow." },
      { gr: "Μπορώ να αφήσω μήνυμα;", en: "Can I leave a message?" },
      { gr: "Ένα λεπτό, παρακαλώ.", en: "One moment, please." },
      { gr: "Λάθος νούμερο.", en: "Wrong number." },
      { gr: "Θα είμαι εκεί στις τρεις.", en: "I will be there at three." },
    ],
  },
  {
    icon: "🏢",
    title: "Work & Office",
    items: [
      { gr: "Δουλεύω σε μια εταιρεία.", en: "I work at a company." },
      { gr: "Η δουλειά μου αρχίζει στις εννέα.", en: "My work starts at nine." },
      { gr: "Έχω πολλή δουλειά σήμερα.", en: "I have a lot of work today." },
      { gr: "Μπορώ να πάρω μια μέρα άδεια;", en: "Can I take a day off?" },
      { gr: "Έχουμε συνάντηση στις δέκα.", en: "We have a meeting at ten." },
      { gr: "Πρέπει να τελειώσω αυτό σήμερα.", en: "I must finish this today." },
      { gr: "Ο μισθός μου είναι καλός.", en: "My salary is good." },
      { gr: "Ψάχνω για δουλειά.", en: "I am looking for a job." },
      { gr: "Στέλνω ένα email στον συνάδελφό μου.", en: "I am sending an email to my colleague." },
      { gr: "Τελειώνω στις πέντε.", en: "I finish at five." },
    ],
  },
  {
    icon: "🎉",
    title: "Celebrations & Invitations",
    items: [
      { gr: "Χρόνια πολλά!", en: "Happy birthday! / Many happy returns!" },
      { gr: "Καλή χρονιά!", en: "Happy New Year!" },
      { gr: "Καλό Πάσχα!", en: "Happy Easter!" },
      { gr: "Θέλεις να έρθεις στο πάρτι μου;", en: "Do you want to come to my party?" },
      { gr: "Με μεγάλη χαρά!", en: "With great pleasure!" },
      { gr: "Δυστυχώς δεν μπορώ να έρθω.", en: "Unfortunately I can't come." },
      { gr: "Τι ώρα αρχίζει;", en: "What time does it start?" },
      { gr: "Να φέρω κάτι;", en: "Shall I bring something?" },
      { gr: "Ευχαριστώ για την πρόσκληση!", en: "Thank you for the invitation!" },
      { gr: "Περάσαμε πολύ ωραία!", en: "We had a great time!" },
    ],
  },
  {
    icon: "🏫",
    title: "School & Studies",
    items: [
      { gr: "Πηγαίνω στο σχολείο κάθε μέρα.", en: "I go to school every day." },
      { gr: "Σπουδάζω στο πανεπιστήμιο.", en: "I study at the university." },
      { gr: "Δεν κατάλαβα. Μπορείτε να επαναλάβετε;", en: "I didn't understand. Can you repeat?" },
      { gr: "Πώς λέμε αυτό στα ελληνικά;", en: "How do we say this in Greek?" },
      { gr: "Πρέπει να διαβάσω για την εξέταση.", en: "I need to study for the exam." },
      { gr: "Πότε είναι οι εξετάσεις;", en: "When are the exams?" },
      { gr: "Πέρασα τις εξετάσεις!", en: "I passed the exams!" },
      { gr: "Έγραψα μια έκθεση.", en: "I wrote an essay." },
      { gr: "Ο δάσκαλος εξηγεί πολύ καλά.", en: "The teacher explains very well." },
      { gr: "Κάνω μάθημα δύο φορές την εβδομάδα.", en: "I have a lesson twice a week." },
    ],
  },
  {
    icon: "🏖️",
    title: "Weather & Seasons",
    items: [
      { gr: "Τι καιρό κάνει σήμερα;", en: "What's the weather like today?" },
      { gr: "Κάνει πολλή ζέστη.", en: "It's very hot." },
      { gr: "Κάνει κρύο σήμερα.", en: "It's cold today." },
      { gr: "Βρέχει. Πάρε ομπρέλα.", en: "It's raining. Take an umbrella." },
      { gr: "Ο καιρός είναι καλός, πάμε βόλτα!", en: "The weather is nice, let's go for a walk!" },
      { gr: "Το καλοκαίρι πάω στη θάλασσα.", en: "In summer I go to the sea." },
      { gr: "Τον χειμώνα χιονίζει στα βουνά.", en: "In winter it snows in the mountains." },
      { gr: "Η άνοιξη είναι η αγαπημένη μου εποχή.", en: "Spring is my favourite season." },
      { gr: "Φυσάει πολύ δυνατά.", en: "It's blowing very hard." },
      { gr: "Αύριο θα έχει ήλιο.", en: "Tomorrow it will be sunny." },
    ],
  },
];

export const matchLessons: MatchLesson[] = [
  {
    id: "type-a",
    label: "Type A: δουλεύω",
    notes: "Regular -ω endings",
    tenses: {
      present: ["δουλεύω", "δουλεύεις", "δουλεύει", "δουλεύουμε", "δουλεύετε", "δουλεύουν"],
      past: ["δούλεψα", "δούλεψες", "δούλεψε", "δουλέψαμε", "δουλέψατε", "δούλεψαν"],
      future: ["θα δουλέψω", "θα δουλέψεις", "θα δουλέψει", "θα δουλέψουμε", "θα δουλέψετε", "θα δουλέψουν"],
    },
  },
  {
    id: "type-b1",
    label: "Type B1: μιλάω",
    notes: "The -άω pattern",
    tenses: {
      present: ["μιλάω", "μιλάς", "μιλά", "μιλάμε", "μιλάτε", "μιλάνε"],
      past: ["μίλησα", "μίλησες", "μίλησε", "μιλήσαμε", "μιλήσατε", "μίλησαν"],
      future: ["θα μιλήσω", "θα μιλήσεις", "θα μιλήσει", "θα μιλήσουμε", "θα μιλήσετε", "θα μιλήσουν"],
    },
  },
  {
    id: "type-b2",
    label: "Type B2: οδηγώ",
    notes: "The stressed -ώ pattern",
    tenses: {
      present: ["οδηγώ", "οδηγείς", "οδηγεί", "οδηγούμε", "οδηγείτε", "οδηγούν"],
      past: ["οδήγησα", "οδήγησες", "οδήγησε", "οδηγήσαμε", "οδηγήσατε", "οδήγησαν"],
      future: ["θα οδηγήσω", "θα οδηγήσεις", "θα οδηγήσει", "θα οδηγήσουμε", "θα οδηγήσετε", "θα οδηγήσουν"],
    },
  },
  {
    id: "irregular-go",
    label: "Irregular: πηγαίνω",
    notes: "Common high-frequency irregular verb",
    tenses: {
      present: ["πηγαίνω", "πηγαίνεις", "πηγαίνει", "πηγαίνουμε", "πηγαίνετε", "πηγαίνουν"],
      past: ["πήγα", "πήγες", "πήγε", "πήγαμε", "πήγατε", "πήγαν"],
      future: ["θα πάω", "θα πας", "θα πάει", "θα πάμε", "θα πάτε", "θα πάνε"],
    },
  },
  {
    id: "irregular-have",
    label: "Irregular: έχω",
    notes: "Useful for possession and many everyday phrases",
    tenses: {
      present: ["έχω", "έχεις", "έχει", "έχουμε", "έχετε", "έχουν"],
      past: ["είχα", "είχες", "είχε", "είχαμε", "είχατε", "είχαν"],
      future: ["θα έχω", "θα έχεις", "θα έχει", "θα έχουμε", "θα έχετε", "θα έχουν"],
    },
  },
];
