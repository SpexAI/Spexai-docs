import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import {
  Link,
  useLocation,
  useNavigate,
  Outlet,
  Navigate,
} from "react-router-dom";
import { docsData } from "../data/docs";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { fetchDocStructure } from "../utils/firestore";
import { motion, AnimatePresence, useScroll } from "framer-motion";

/* ===============================
   Styled Components – Layout
================================= */

// Main container
const Container = styled.div`
  display: flex;
  height: 100vh;
  background: ${(props) => props.theme.colors.background};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

// Mobile menu button (visible on small screens)
const MenuButton = styled.button`
  display: none;
  position: fixed;
  top: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  z-index: 1000;
  background: ${({ theme }) => theme.colors.sidebar};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: transform ${({ theme }) => theme.transitions.fast};

  &:hover {
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = styled.div`
  width: 280px;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.4);
  border-right: 1px solid ${(props) => props.theme.colors.border};
  overflow-y: auto;
  height: 100vh;

  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 0;
    width: 100%;
    height: calc(100vh - 60px);
    transform: translateX(${(props) => (props.isOpen ? "0" : "-100%")});
    transition: transform 0.3s ease;
    z-index: 1000;
  }
`;

// Sidebar inner content
const SidebarContent = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    height: auto;
  }
`;

const SidebarHeader = styled.div`
  position: sticky;
  top: 0;
  background: ${(props) => props.theme.colors.sidebar};
  backdrop-filter: blur(10px);
  z-index: 2;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const NavContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

// Main content area
const MainContent = styled(motion.main)`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: radial-gradient(
    circle at bottom right,
    rgba(74, 222, 128, 0.1),
    transparent 50%
  );

  @media (max-width: 768px) {
    min-height: 0;
  }
`;

// Wraps inner content for better readability
const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: ${(props) => props.theme.spacing.xxl};
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing.lg};
  }
`;

// Logo area
const Logo = styled.div`
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LogoImage = styled.img`
  height: 28px;
  width: auto;
`;

// Navigation and sidebar elements
const Section = styled.div`
  margin-bottom: 0.5rem;
`;

const SectionTitle = styled.div`
  padding: 1.5rem 1.5rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${(props) => props.theme.colors.textMuted};
`;

const NavList = styled.div`
  margin: 0 0 1.5rem 1rem;
`;

const NavItem = styled(motion.div)`
  margin: 1px 0;
`;

const Nav = styled.nav`
  display: flex;
  flex-direction: column;
`;

const NavLink = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  color: ${(props) =>
    props.active ? props.theme.colors.accent : props.theme.colors.text};
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: ${(props) => (props.active ? "500" : "400")};
  background: ${(props) =>
    props.active ? props.theme.colors.activeBackground : "transparent"};
  border-left: 2px solid
    ${(props) => (props.active ? props.theme.colors.accent : "transparent")};
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
    background: ${(props) =>
      props.active
        ? props.theme.colors.activeBackground
        : props.theme.colors.hoverBackground};
  }
`;

// Theme toggle button
const ThemeToggle = styled.button`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.sidebar};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.sidebarHover};
  }
`;

// Overlay for mobile view when sidebar is open
const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 90;
  }
`;

const MobileHeader = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    width: 100%;
    height: 60px;
    padding: 0 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(10px);
    z-index: 1001;
  }
`;

const MobileNav = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  justify-content: space-between;
  max-width: 100%;
`;

const MobileLogo = styled.div`
  @media (max-width: 768px) {
    flex: 1;
    display: flex;
    justify-content: center;

    img {
      height: 24px;
      width: auto;
    }
  }
`;

const AuthButtonContainer = styled.div`
  display: block;
  position: fixed;
  top: 1rem;
  right: 2rem;
  z-index: 1002;

  @media (max-width: 768px) {
    position: static;
    display: flex;
    justify-content: flex-end;
  }
`;

const AuthButton = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  background: linear-gradient(
    97.38deg,
    #fe3f68 -5.06%,
    #9b4bcc 30.57%,
    #4a6eec 74.68%,
    #2fdda2 105.9%
  );
  border: none;
  border-radius: 40px !important;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 1;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const LoadingState = styled.div`
  text-align: center;
  padding: ${(props) => props.theme.spacing.xl};
  color: ${(props) => props.theme.colors.textLight};
`;

const SubsectionTitle = styled.h4`
  color: ${(props) => props.theme.colors.textLight};
  font-size: ${(props) => props.theme.fontSizes.sm};
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  margin-top: ${(props) => props.theme.spacing.sm};
`;

const SectionButton = styled.button`
  width: 100%;
  text-align: left;
  padding: ${(props) => props.theme.spacing.sm}
    ${(props) => props.theme.spacing.md};
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-weight: ${(props) => props.theme.fontWeights.medium};
  font-size: ${(props) => props.theme.fontSizes.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    color: ${(props) => props.theme.colors.accent};
  }
`;

const SubsectionContent = styled.div``;

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  margin: 0.5rem 1.5rem;
  max-height: 300px;
  overflow-y: auto;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10;
`;

const SearchResultItem = styled.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
  }
`;

const SearchContainer = styled.div`
  padding: 0 1.5rem 1rem;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  position: relative;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.6rem 1.2rem;
  border-radius: 40px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.2);
  color: ${(props) => props.theme.colors.text};
  font-size: 0.9rem;
  outline: none;
  transition: all 0.2s ease;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.2);
    background-color: rgba(0, 0, 0, 0.3);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
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

const Footer = styled.footer`
  padding: 2rem;
  border-top: 1px solid ${(props) => props.theme.colors.border};
  margin-top: auto;
  backdrop-filter: blur(10px);
  background-color: rgba(0, 0, 0, 0.4);
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 1rem;

  a {
    color: #9ca3af;
    transition: color 0.2s ease;

    &:hover {
      color: white;
    }
  }
`;

const Copyright = styled.div`
  color: #9ca3af;
  font-size: 0.9rem;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${(props) => props.theme.spacing.xl};

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing.lg};
  }
`;

// First, make sure there's only ONE ScrollIndicator styled component definition
const ScrollIndicator = styled(motion.div)`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 6px;
  background: linear-gradient(to bottom, #fe3f68, #9b4bcc, #4a6eec, #2fdda2);
  transform-origin: top;
  z-index: 10;

  @media (min-width: 769px) {
    left: 280px;
  }

  @media (max-width: 768px) {
    right: 0;
  }
`;

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname.split("/")[2] || "";
  const { user, handleLogin, handleLogout } = useAuth();
  const [docStructure, setDocStructure] = useState({
    public: [],
    protected: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const loadStructure = async () => {
      setLoading(true);
      try {
        const structure = await fetchDocStructure();
        setDocStructure(structure);
      } catch (error) {
        console.error("Error loading structure:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStructure();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".search-container")) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (location.pathname === "/") {
    if (
      docStructure.public.length > 0 &&
      docStructure.public[0].items.length > 0
    ) {
      const firstDoc = docStructure.public[0].items[0];
      return <Navigate to={`/docs/${firstDoc.id}`} replace />;
    }
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
  }

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = [];

    // Search through public docs
    docStructure.public.forEach((section) => {
      section.items.forEach((item) => {
        if (
          item.title.toLowerCase().includes(query) ||
          item.content?.toLowerCase().includes(query)
        ) {
          results.push({
            id: item.id,
            title: item.title,
            path: `/docs/${item.id}`,
            section: section.title,
          });
        }
      });
    });

    // Search through protected docs if user is logged in
    if (user) {
      docStructure.protected.forEach((section) => {
        section.items.forEach((item) => {
          if (
            item.title.toLowerCase().includes(query) ||
            item.content?.toLowerCase().includes(query)
          ) {
            results.push({
              id: item.id,
              title: item.title,
              path: `/protected/docs/${item.id}`,
              section: section.title,
            });
          }
        });
      });
    }

    setSearchResults(results);
    setShowResults(true);
  };

  const handleResultClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <Container>
      <ScrollIndicator style={{ scaleY: scrollYProgress }} />
      <MobileHeader>
        <MenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? "✕" : "☰"}
        </MenuButton>
        <MobileLogo>
          <LogoImage
            src="https://spexai.com/wp-content/uploads/2024/06/logo-white.svg"
            alt="SpexAI"
          />
        </MobileLogo>
        {user ? (
          <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
        ) : (
          <AuthButton onClick={handleLogin}>Sign In</AuthButton>
        )}
      </MobileHeader>

      <AuthButtonContainer>
        {user ? (
          <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
        ) : (
          <AuthButton onClick={handleLogin}>Sign In</AuthButton>
        )}
      </AuthButtonContainer>

      <Sidebar isOpen={isMobileMenuOpen}>
        <SidebarContent onClick={handleNavClick}>
          <SidebarHeader>
            <Logo>
              <LogoImage
                src="https://spexai.com/wp-content/uploads/2024/06/logo-white.svg"
                alt="SpexAI"
              />
            </Logo>
            <SearchContainer className="search-container">
              <SearchInput
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={handleSearch}
              />
              {showResults && searchResults.length > 0 && (
                <SearchResults>
                  {searchResults.map((result) => (
                    <SearchResultItem
                      key={result.id}
                      onClick={() => handleResultClick(result.path)}
                    >
                      <div style={{ fontWeight: 500 }}>{result.title}</div>
                      <div style={{ fontSize: "0.8rem", color: "#9CA3AF" }}>
                        {result.section}
                      </div>
                    </SearchResultItem>
                  ))}
                </SearchResults>
              )}
            </SearchContainer>
          </SidebarHeader>

          <NavContainer>
            {docStructure.public.map((section) => (
              <Section key={section.id}>
                <SectionTitle>{section.title}</SectionTitle>
                <NavList>
                  {section.items.map((item) => (
                    <NavItem key={item.id}>
                      <NavLink
                        to={`/docs/${item.id}`}
                        active={currentPath === item.id}
                      >
                        {item.title}
                      </NavLink>
                    </NavItem>
                  ))}
                </NavList>
              </Section>
            ))}

            {user &&
              docStructure.protected.map((section) => (
                <Section key={section.id}>
                  <SectionTitle>
                    {section.title}
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      🔒
                    </span>
                  </SectionTitle>
                  <NavList>
                    {section.items.map((item) => (
                      <NavItem key={item.id}>
                        <NavLink
                          to={`/protected/docs/${item.id}`}
                          active={currentPath === item.id}
                        >
                          {item.title}
                        </NavLink>
                      </NavItem>
                    ))}
                  </NavList>
                </Section>
              ))}
          </NavContainer>
        </SidebarContent>
      </Sidebar>
      <MainContent>
        <ContentArea>
          <Outlet />
        </ContentArea>
        <Footer>
          <FooterContent>
            <Copyright>© 2025 SpexAI. All rights reserved</Copyright>
            <SocialLinks>
              <a
                href="https://www.linkedin.com/company/spexai/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 448 512"
                  fill="currentColor"
                >
                  <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
                </svg>
              </a>
              <a
                href="https://x.com/SpexAI/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 512 512"
                  fill="currentColor"
                >
                  <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z" />
                </svg>
              </a>
            </SocialLinks>
          </FooterContent>
        </Footer>
      </MainContent>
    </Container>
  );
}

export default Layout;
