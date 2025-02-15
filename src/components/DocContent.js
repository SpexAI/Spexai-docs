// src/components/DocContent.js
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const DocWrapper = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  color: ${(props) => props.theme.colors.text};

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: ${(props) =>
      props.theme.isDark
        ? `linear-gradient(
        97.38deg,
        rgba(254, 63, 104, 0.05) -5.06%,
        rgba(155, 75, 204, 0.05) 30.57%,
        rgba(74, 110, 236, 0.05) 74.68%,
        rgba(47, 221, 162, 0.05) 105.9%
      )`
        : `linear-gradient(
        97.38deg,
        rgba(254, 63, 104, 0.02) -5.06%,
        rgba(155, 75, 204, 0.02) 30.57%,
        rgba(74, 110, 236, 0.02) 74.68%,
        rgba(47, 221, 162, 0.02) 105.9%
      )`};
    pointer-events: none;
  }

  h1 {
    font-size: ${(props) => props.theme.fontSizes["4xl"]};
    margin-bottom: 1rem;
    font-weight: 600;
  }

  h2 {
    font-size: ${(props) => props.theme.fontSizes["2xl"]};
    margin: 2rem 0 1rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  code {
    background: ${(props) => props.theme.colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: ${(props) => props.theme.borderRadius.sm};
    font-family: ${(props) => props.theme.fonts.code};
    font-size: 0.9em;
    border: 1px solid ${(props) => props.theme.colors.codeBorder};
  }

  pre {
    background: ${(props) => props.theme.colors.codeBg};
    padding: 1rem;
    border-radius: ${(props) => props.theme.borderRadius.md};
    overflow-x: auto;
    border: 1px solid ${(props) => props.theme.colors.codeBorder};
    margin: 1rem 0;
  }

  pre code {
    background: none;
    padding: 0;
    border: none;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;

    li {
      margin-bottom: 0.5rem;
    }
  }

  img {
    max-width: 100%;
    border-radius: ${(props) => props.theme.borderRadius.md};
    border: 1px solid ${(props) => props.theme.colors.imageBorder};
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.textLight};
`;

const DocHeader = styled.div`
  margin-bottom: 2rem;
`;

const DocTitle = styled.h1`
  font-size: ${(props) => props.theme.fontSizes["4xl"]};
  font-weight: ${(props) => props.theme.fontWeights.bold};
  margin-bottom: ${(props) => props.theme.spacing.md};
  letter-spacing: -0.02em;

  @media (max-width: 768px) {
    font-size: ${(props) => props.theme.fontSizes["3xl"]};
  }
`;

const DocMeta = styled.div`
  color: ${(props) => props.theme.colors.textMuted};
  font-size: ${(props) => props.theme.fontSizes.sm};
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: 4rem;
`;

const Spinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: #4a6eec;
  border-right-color: #9b4bcc;
  border-bottom-color: #fe3f68;
  border-left-color: #2fdda2;
`;

function DocContent() {
  const { docId } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const q = query(collection(db, "docs"), where("id", "==", docId));

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();

          // Fetch section to check type
          const sectionSnapshot = await getDocs(
            query(
              collection(db, "sections"),
              where("__name__", "==", docData.sectionId)
            )
          );

          if (!sectionSnapshot.empty) {
            const section = sectionSnapshot.docs[0].data();

            // Check access
            if (section.type === "protected" && !user) {
              setContent(
                "# Access Denied\n\nPlease sign in to view this content."
              );
            } else {
              setDoc(docData);
              setContent(docData.content);
            }
          }
        } else {
          setContent(
            "# Not Found\n\nThe requested documentation page could not be found."
          );
        }
      } catch (error) {
        console.error("Error fetching doc:", error);
        setContent(
          "# Error\n\nAn error occurred while loading the documentation."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [docId, user]);

  if (loading) {
    return (
      <SpinnerContainer>
        <Spinner
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </SpinnerContainer>
    );
  }

  return (
    <DocWrapper>
      {doc && (
        <DocHeader>
          <DocTitle>{doc.title}</DocTitle>
          <DocMeta>{doc.subSection && <span>{doc.subSection}</span>}</DocMeta>
        </DocHeader>
      )}
      <ReactMarkdown>{content}</ReactMarkdown>
    </DocWrapper>
  );
}

export default DocContent;
