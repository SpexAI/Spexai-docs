// src/components/DocContent.js
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import mermaid from "mermaid";
import { useEffect, useState, useMemo, useRef } from "react";
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
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import remarkDirective from "remark-directive";
import DOMPurify from "dompurify";

// Initialize mermaid globally once
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

  @media (max-width: 768px) {
    padding: 1rem;
  }

  p img,
  p video {
    max-width: calc(100% - 100px) !important;
    width: auto !important;
    height: auto !important;
    display: block !important;
    margin: 2rem auto !important;
    border-radius: 16px !important;
  }

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
    max-width: 100% !important;
    width: auto !important;
    height: auto !important;
    margin: 1.5rem 0 !important;
    border-radius: ${({ theme }) => theme.borderRadius.md};

    @media (max-width: 768px) {
      margin: 1rem 0 !important;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
    }
  }

  table {
    width: 100%;
    margin: 1.5rem 0;
    border-collapse: collapse;

    @media (max-width: 768px) {
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      font-size: 14px;
    }

    th,
    td {
      padding: 0.75rem;
      border: 1px solid ${({ theme }) => theme.colors.border};
      min-width: 120px;
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
      background: white;
      border-radius: ${({ theme }) => theme.borderRadius.sm};
      padding: 1rem;
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
    margin: 1.5rem 0;
    padding: 1.5rem;
    border-radius: ${({ theme }) => theme.borderRadius.md};
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    @media (max-width: 768px) {
      margin: 1rem -1rem;
      padding: 1rem;
      border-radius: 0;
      font-size: 14px;
    }

    code {
      font-size: inherit;
    }
  }

  // LaTeX styles
  .katex {
    font-size: 1.1em;

    @media (max-width: 768px) {
      font-size: 1em;
    }
  }

  .katex-display {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    padding: 1rem 0;

    @media (max-width: 768px) {
      padding: 0.5rem 0;
    }
  }
`;

const ModalContainer = styled.div`
  position: relative;
  z-index: 99999999;
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1003;
  cursor: pointer;

  img {
    max-width: 90%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 16px;
  }
`;

// Create a proper Mermaid component
const MermaidDiagram = ({ chart }) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && chart) {
      const renderChart = async () => {
        elementRef.current.innerHTML = "";
        const sanitizedChart = DOMPurify.sanitize(chart);
        try {
          const { svg } = await mermaid.render("mermaid-svg", sanitizedChart);
          elementRef.current.innerHTML = svg;
        } catch (error) {
          console.error("Mermaid rendering error:", error);
          elementRef.current.innerHTML = "Failed to render diagram";
        }
      };
      renderChart();
    }
  }, [chart]);

  return <div className="mermaid" ref={elementRef} />;
};

const DocContent = () => {
  const { docId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // Get the base URL
  const baseUrl = window.location.origin;
  const currentUrl = `${baseUrl}${location.pathname}`;

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

  // Extract first image from markdown content
  const getFirstImage = (content) => {
    if (!content) return null;
    // Look for both markdown and HTML image syntax
    const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
    const htmlMatch = content.match(/<img.*?src=["'](.*?)["']/);
    return markdownMatch?.[1] || htmlMatch?.[1] || null;
  };

  // Update the default image
  const defaultImage =
    "https://spexai.com/wp-content/uploads/2024/05/spexai-home-image3-768x512.jpg";

  // Get document image or default
  const documentImage = useMemo(() => {
    if (!document?.content) return defaultImage;
    const contentImage = getFirstImage(document.content);
    // Ensure image URL is absolute
    if (contentImage && !contentImage.startsWith("http")) {
      return `${baseUrl}${contentImage}`;
    }
    return contentImage || defaultImage;
  }, [document?.content, baseUrl]);

  // Get meta description
  const getMetaDescription = (content) => {
    if (!content) return "SpexAI Documentation and Guides";
    // Remove markdown syntax and get first 160 characters
    const plainText = content
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove links
      .replace(/[#*`]/g, "") // Remove markdown syntax
      .replace(/\n/g, " ") // Replace newlines with spaces
      .trim();
    return plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");
  };

  // Custom renderer for markdown elements
  const components = {
    img: ({ node, ...props }) => {
      const isVideo =
        props.src?.match(/\.(mp4|webm|ogg|mov)/i) ||
        props.alt?.match(/\.(mp4|webm|ogg|mov)$/i);

      if (isVideo) {
        return (
          <video controls style={{ maxWidth: "100%" }} playsInline>
            <source src={props.src} />
            Your browser does not support the video tag.
          </video>
        );
      }

      return (
        <img
          {...props}
          style={{ maxWidth: "100%", cursor: "pointer" }}
          onClick={() => setSelectedImage(props.src)}
        />
      );
    },
    div: ({ node, className, children, ...props }) => {
      if (className === "mermaid") {
        const content = Array.isArray(children)
          ? children.join("")
          : String(children || "");
        return (
          <div className="mermaid" {...props}>
            {content}
          </div>
        );
      }
      return (
        <div className={className} {...props}>
          {children}
        </div>
      );
    },
  };

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
    <ModalContainer>
      <DocWrapper>
        <h1>{document.title}</h1>
        {formattedDate && <div>Last updated: {formattedDate}</div>}
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, remarkDirective]}
          rehypePlugins={[
            rehypeRaw,
            [
              rehypeKatex,
              {
                throwOnError: false,
                trust: true,
              },
            ],
          ]}
          components={components}
        >
          {document?.content || ""}
        </ReactMarkdown>
      </DocWrapper>
      {selectedImage && (
        <ImageModal onClick={() => setSelectedImage(null)}>
          <img
            src={selectedImage}
            alt="Enlarged view"
            onClick={(e) => e.stopPropagation()}
          />
        </ImageModal>
      )}
      {document && (
        <Helmet prioritizeSeoTags={true}>
          <title>
            {document.title
              ? `${document.title} - SpexAI Docs`
              : "SpexAI Documentation"}
          </title>

          {/* Force override meta tags */}
          <meta
            name="description"
            content={getMetaDescription(document.content)}
            data-rh="true"
          />
          <meta property="og:type" content="article" data-rh="true" />
          <meta property="og:url" content={currentUrl} data-rh="true" />
          <meta
            property="og:site_name"
            content="SpexAI Documentation"
            data-rh="true"
          />
          <meta
            property="og:title"
            content={document.title || "SpexAI Documentation"}
            data-rh="true"
          />
          <meta
            property="og:description"
            content={getMetaDescription(document.content)}
            data-rh="true"
          />
          <meta
            property="og:image"
            content={getFirstImage(document.content) || defaultImage}
            data-rh="true"
          />
          <meta property="og:image:width" content="768" data-rh="true" />
          <meta property="og:image:height" content="512" data-rh="true" />

          <meta
            name="twitter:card"
            content="summary_large_image"
            data-rh="true"
          />
          <meta name="twitter:domain" content={baseUrl} data-rh="true" />
          <meta name="twitter:url" content={currentUrl} data-rh="true" />
          <meta
            name="twitter:title"
            content={document.title || "SpexAI Documentation"}
            data-rh="true"
          />
          <meta
            name="twitter:description"
            content={getMetaDescription(document.content)}
            data-rh="true"
          />
          <meta
            name="twitter:image"
            content={getFirstImage(document.content) || defaultImage}
            data-rh="true"
          />
        </Helmet>
      )}
    </ModalContainer>
  );
};

export default DocContent;
