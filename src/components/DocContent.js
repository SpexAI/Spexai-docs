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
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(
        circle at 10% 0%,
        ${(props) => props.theme.colors.primary}05 0%,
        transparent 40%
      ),
      radial-gradient(
        circle at 90% 90%,
        ${(props) => props.theme.colors.accent}05 0%,
        transparent 40%
      );
    z-index: -1;
    pointer-events: none;
  }

  @media (max-width: 768px) {
    padding: 1rem;
    margin-top: 60px;
  }

  /* Headings */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${(props) => props.theme.colors.text};
  }

  h1 {
    font-size: ${(props) => props.theme.fontSizes["4xl"]};
    font-weight: ${(props) => props.theme.fontWeights.bold};
    margin-bottom: ${(props) => props.theme.spacing.md};
    letter-spacing: -0.02em;

    @media (max-width: 768px) {
      font-size: ${(props) => props.theme.fontSizes["3xl"]};
    }
  }

  h2 {
    font-size: ${(props) => props.theme.fontSizes["2xl"]};
    font-weight: ${(props) => props.theme.fontWeights.semibold};
    margin-top: ${(props) => props.theme.spacing.xxl};
    margin-bottom: ${(props) => props.theme.spacing.lg};
  }

  h3 {
    font-size: ${(props) => props.theme.fontSizes.xl};
    font-weight: ${(props) => props.theme.fontWeights.semibold};
    margin-top: ${(props) => props.theme.spacing.xl};
    margin-bottom: ${(props) => props.theme.spacing.md};
  }

  /* Paragraphs and Lists */
  p,
  ul,
  ol {
    margin-bottom: ${(props) => props.theme.spacing.lg};
    line-height: 1.7;
    color: ${(props) => props.theme.colors.textLight};
  }

  ul,
  ol {
    padding-left: ${(props) => props.theme.spacing.xl};
  }

  li {
    margin-bottom: ${(props) => props.theme.spacing.sm};
    color: ${(props) => props.theme.colors.textLight};
  }

  /* Links */
  a {
    color: ${(props) => props.theme.colors.primary};
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: all ${(props) => props.theme.transitions.fast};

    &:hover {
      color: ${(props) => props.theme.colors.primaryHover};
      border-bottom-color: ${(props) => props.theme.colors.primaryHover};
    }
  }

  /* Code blocks */
  pre {
    background: ${(props) => props.theme.colors.codeBg};
    border: 1px solid ${(props) => props.theme.colors.codeBorder};
    border-radius: ${(props) => props.theme.borderRadius.lg};
    padding: ${(props) => props.theme.spacing.lg};
    margin: ${(props) => props.theme.spacing.xl} 0;
    overflow-x: auto;
    font-family: ${(props) => props.theme.fonts.code};
    font-size: ${(props) => props.theme.fontSizes.sm};
    line-height: 1.6;
    color: ${(props) => props.theme.colors.code};
    max-width: 100%;
  }

  code {
    font-family: ${(props) => props.theme.fonts.code};
    font-size: 0.9em;
    background: ${(props) => props.theme.colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: ${(props) => props.theme.borderRadius.sm};
    color: ${(props) => props.theme.colors.code};
  }

  /* Blockquotes */
  blockquote {
    border-left: 4px solid ${(props) => props.theme.colors.primary};
    padding-left: ${(props) => props.theme.spacing.lg};
    margin: ${(props) => props.theme.spacing.xl} 0;
    font-style: italic;
    color: ${(props) => props.theme.colors.textLight};
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: ${(props) => props.theme.spacing.xl} 0;
    overflow-x: auto;
    display: block;
  }

  th,
  td {
    padding: ${(props) => props.theme.spacing.md};
    border: 1px solid ${(props) => props.theme.colors.border};
    color: ${(props) => props.theme.colors.textLight};
  }

  th {
    background: ${(props) => props.theme.colors.sidebar};
    font-weight: ${(props) => props.theme.fontWeights.semibold};
    text-align: left;
    color: ${(props) => props.theme.colors.text};
  }

  /* Images */
  img {
    max-width: 100%;
    height: auto;
    border-radius: ${(props) => props.theme.borderRadius["3xl"]};
    border: 1px solid ${(props) => props.theme.colors.imageBorder};
    margin: ${(props) => props.theme.spacing.xl} 0;
    transition: all ${(props) => props.theme.transitions.default};

    &:hover {
      transform: scale(1.01);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
  }

  /* Horizontal Rule */
  hr {
    border: none;
    border-top: 1px solid ${(props) => props.theme.colors.border};
    margin: ${(props) => props.theme.spacing.xl} 0;
  }

  /* Inline Elements */
  strong {
    font-weight: ${(props) => props.theme.fontWeights.semibold};
    color: ${(props) => props.theme.colors.text};
  }

  em {
    font-style: italic;
    color: ${(props) => props.theme.colors.textLight};
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
