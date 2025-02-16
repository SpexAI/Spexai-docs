// src/components/DocContent.js
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import mermaid from "mermaid";
import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import {
  getFirestore,
  doc as firestoreDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { Helmet } from "react-helmet-async";

mermaid.initialize({
  startOnLoad: true,
  theme: "default",
  securityLevel: "loose",
});

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
`;

const LoadingSpinner = styled(motion.div)`
  width: 50px;
  height: 50px;
  border: 5px solid transparent;
  border-top: 5px solid #fe3f68;
  border-right: 5px solid #9b4bcc;
  border-bottom: 5px solid #4a6eec;
  border-left: 5px solid #2fdda2;
  border-radius: 50%;
`;

const DocWrapper = styled.div`
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  color: ${({ theme }) => theme.colors.text};
  z-index: 1;

  h1 {
    font-size: ${({ theme }) => theme.fontSizes["4xl"]};
    margin-bottom: 1rem;
    font-weight: 600;
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
    margin: 2rem 0 1rem;
    font-weight: 600;
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    margin: 1.5rem 0 1rem;
    font-weight: 600;
  }

  h4 {
    font-size: ${({ theme }) => theme.fontSizes.lg};
    margin: 1.5rem 0 1rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;

    li {
      margin-bottom: 0.5rem;
      line-height: 1.6;

      &::marker {
        color: ${({ theme }) => theme.colors.accent};
      }
    }
  }

  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.5rem;
    border-left: 4px solid ${({ theme }) => theme.colors.accent};
    background: ${({ theme }) => theme.colors.codeBg};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    font-style: italic;

    p {
      margin: 0;
    }
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    border-bottom: 1px dashed ${({ theme }) => theme.colors.accent};
    transition: all 0.2s ease;

    &:hover {
      color: ${({ theme }) => theme.colors.accentHover};
      border-bottom-style: solid;
    }
  }

  img {
    max-width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    margin: 1.5rem 0;
  }

  table {
    width: 100%;
    margin: 1.5rem 0;
    border-collapse: collapse;

    th,
    td {
      padding: 0.75rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
    }

    th {
      background: ${({ theme }) => theme.colors.codeBg};
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: ${({ theme }) => theme.colors.codeBg}50;
    }
  }

  hr {
    margin: 2rem 0;
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
  }

  .mermaid {
    background: linear-gradient(
      97.38deg,
      #fe3f68 -5.06%,
      #9b4bcc 30.57%,
      #4a6eec 74.68%,
      #2fdda2 105.9%
    );
    padding: 2rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 1px solid ${({ theme }) => theme.colors.border};
    margin: 1.5rem 0;
    width: 100%;
    overflow-x: auto;

    svg {
      width: 100% !important;
      height: 100% !important;
    }
  }

  code {
    background: ${({ theme }) => theme.colors.codeBg};
    padding: 0.2em 0.4em;
    border-radius: ${({ theme }) => theme.borderRadius.sm};
    font-family: ${({ theme }) => theme.fonts.code};
    font-size: 0.9em;
    border: 1px solid ${({ theme }) => theme.colors.codeBorder};
  }

  pre {
    background: ${({ theme }) => theme.colors.codeBg};
    padding: 1rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
    border: 1px solid ${({ theme }) => theme.colors.codeBorder};
    margin: 1rem 0;

    code {
      background: none;
      padding: 0;
      border: none;
      font-size: ${({ theme }) => theme.fontSizes.sm};
    }
  }
`;

const DocContent = () => {
  const { docId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  // Memoize mermaid initialization
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "default",
      securityLevel: "loose",
    });
  }, []);

  useEffect(() => {
    const fetchDoc = async () => {
      if (!docId) return;

      const db = getFirestore();

      try {
        const docsQuery = query(
          collection(db, "docs"),
          where("id", "==", docId)
        );

        const querySnapshot = await getDocs(docsQuery);

        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          const docData = { firebaseId: doc.id, ...doc.data() };
          setDocument(docData);
        }
      } catch (error) {
        console.error("Error fetching doc:", error);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchDoc();
  }, [docId, location.pathname]);

  // Memoize mermaid rendering
  useEffect(() => {
    if (document?.content) {
      const timer = setTimeout(() => {
        mermaid.contentLoaded();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [document?.content]);

  // Format date
  const formattedDate = useMemo(() => {
    if (!document?.updatedAt) return "";
    try {
      // Handle both timestamp and date string formats
      const date = document.updatedAt?.seconds
        ? new Date(document.updatedAt.seconds * 1000)
        : new Date(document.updatedAt);

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  }, [document?.updatedAt]);

  if (loading) {
    return (
      <LoadingWrapper>
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </LoadingWrapper>
    );
  }

  if (!document) return null;

  return (
    <>
      <Helmet>
        <title>
          {document?.title
            ? `${document.title} | SpexAI Docs`
            : "SpexAI Documentation"}
        </title>
        <meta
          name="description"
          content={document?.description || "SpexAI Documentation"}
        />
        <meta
          property="og:title"
          content={document?.title || "SpexAI Documentation"}
        />
        <meta
          property="og:description"
          content={document?.description || "SpexAI Documentation"}
        />
        <meta
          name="twitter:title"
          content={document?.title || "SpexAI Documentation"}
        />
        <meta
          name="twitter:description"
          content={document?.description || "SpexAI Documentation"}
        />
      </Helmet>
      <DocWrapper>
        <h1>{document.title}</h1>
        {formattedDate && <div>Last updated: {formattedDate}</div>}
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
          {document.content}
        </ReactMarkdown>
      </DocWrapper>
    </>
  );
};

export default DocContent;
