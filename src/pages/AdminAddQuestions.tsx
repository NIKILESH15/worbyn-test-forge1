import { supabase } from '../../supabaseClient'; // adjust path if needed

async function handleAddQuestion() {
  // Convert pasted images to blobs and upload them to Supabase Storage
  const uploadAndReplaceImages = async (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const images = doc.querySelectorAll('img');

    for (const img of images) {
      const base64 = img.src;
      if (base64.startsWith('data:image/')) {
        const res = await fetch(base64);
        const blob = await res.blob();
        const fileName = `question-images/${Date.now()}-${Math.random()}.png`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('questions')
          .upload(fileName, blob, {
            contentType: 'image/png',
          });

        if (!error) {
          const publicUrl = supabase.storage
            .from('questions')
            .getPublicUrl(fileName).data.publicUrl;

          img.src = publicUrl;
        }
      }
    }

    return doc.body.innerHTML;
  };

  const cleanedQuestionText = await uploadAndReplaceImages(questionText);
  const cleanedOptionA = await uploadAndReplaceImages(optionA);
  const cleanedOptionB = await uploadAndReplaceImages(optionB);
  const cleanedOptionC = await uploadAndReplaceImages(optionC);
  const cleanedOptionD = await uploadAndReplaceImages(optionD);

  const { error } = await supabase
    .from('mcq_questions')
    .insert([
      {
        questionText: cleanedQuestionText,
        optionA: cleanedOptionA,
        optionB: cleanedOptionB,
        optionC: cleanedOptionC,
        optionD: cleanedOptionD,
        correctAnswer: correctAnswer,
      },
    ]);

  if (error) {
    console.error('Insert error:', error.message);
    alert('Error adding question');
  } else {
    alert('Question added successfully!');
  }
}
