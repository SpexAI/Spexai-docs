import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

const db = getFirestore();

export const fetchDocStructure = async () => {
  try {
    // First, fetch all sections
    const sectionsSnapshot = await getDocs(collection(db, "sections"));

    const sections = {
      public: [],
      protected: [],
    };

    // Build the structure
    for (const sectionDoc of sectionsSnapshot.docs) {
      const section = sectionDoc.data();
      section.id = sectionDoc.id;

      // Fetch docs for this section
      const docsSnapshot = await getDocs(collection(db, "docs"));
      const sectionDocs = docsSnapshot.docs
        .map((doc) => ({
          ...doc.data(),
          firebaseId: doc.id,
        }))
        .filter((doc) => doc.sectionId === sectionDoc.id)
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      // Add to main structure
      const sectionType = section.type || "public";
      sections[sectionType].push({
        ...section,
        items: sectionDocs,
      });
    }

    // Sort sections
    sections.public.sort((a, b) => (a.order || 0) - (b.order || 0));
    sections.protected.sort((a, b) => (a.order || 0) - (b.order || 0));

    return sections;
  } catch (error) {
    console.error("Error fetching doc structure:", error);
    throw error;
  }
};
