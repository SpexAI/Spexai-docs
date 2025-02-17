import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
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
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -200px;
    right: -400px;
    width: 800px;
    height: 800px;
    background: radial-gradient(
      circle at center,
      rgba(47, 221, 162, 0.15) 0%,
      rgba(74, 110, 236, 0.12) 45%,
      rgba(155, 75, 204, 0.1) 70%,
      rgba(254, 63, 104, 0) 100%
    );
    filter: blur(50px);
    animation: blob 15s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
    opacity: ${({ theme }) => (theme.isDark ? 0.3 : 1)};
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -300px;
    left: -300px;
    width: 600px;
    height: 600px;
    background: radial-gradient(
      circle at center,
      rgba(74, 110, 236, 0.15) 0%,
      rgba(47, 221, 162, 0.12) 45%,
      rgba(254, 63, 104, 0.1) 70%,
      rgba(155, 75, 204, 0) 100%
    );
    filter: blur(30px);
    animation: blob 20s ease-in-out infinite reverse;
    pointer-events: none;
    z-index: 0;
    opacity: ${({ theme }) => (theme.isDark ? 0.3 : 1)};
  }
`;

// Mobile menu button (visible on small screens)
const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar = styled.aside`
  width: 300px;
  height: 100vh;
  overflow-y: auto;
  backdrop-filter: ${({ theme }) =>
    theme.mode === "light" ? "none" : "blur(10px)"};
  background-color: ${({ theme }) =>
    theme.mode === "light" ? "#ffffff" : "rgba(0, 0, 0, 0.4)"};
  border-right: 1px solid ${(props) => props.theme.colors.border};
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1002;
  transition: transform 0.3s ease;

  @media (max-width: 768px) {
    top: 60px; // Account for mobile header
    transform: translateX(${({ $isOpen }) => ($isOpen ? "0" : "-100%")});
    width: 85%;
    max-width: 300px;
    height: calc(100vh - 60px);
  }
`;

// Sidebar inner content
const SidebarContent = styled.div`
  padding: 1rem;
  background: ${({ theme }) =>
    theme.mode === "light" ? "#ffffff" : theme.colors.sidebar};
`;

const SidebarHeader = styled.div`
  position: sticky;
  top: 0;
  background: ${({ theme }) =>
    theme.mode === "light" ? "#ffffff" : theme.colors.sidebar};
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
const MainContent = styled.main`
  flex: 1;
  margin-left: 300px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: 1;

  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: 60px; // Account for mobile header
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
  display: flex;
  justify-content: center;
  align-items: center;

  @media (max-width: 768px) {
    display: none; // Hide desktop logo on mobile
  }
`;

const LogoImage = styled.img`
  height: 28px;
  width: auto;
`;

// Navigation and sidebar elements
const SectionContainer = styled.div`
  margin-bottom: 1rem;
`;

const SectionHeader = styled.div`
  font-weight: 600;
  padding: 0.5rem;
  color: ${(props) => props.theme.colors.text};
`;

const SectionItems = styled.div`
  padding-left: 1rem;
`;

const SectionItem = styled.div`
  padding: 0.25rem 0;
`;

const SectionLink = styled(Link)`
  color: ${(props) => props.theme.colors.text};
  text-decoration: none;
  display: block;
  padding: 0.5rem;
  border-radius: 0.375rem;

  &:hover {
    background: ${({ theme }) =>
      theme.mode === "light"
        ? theme.colors.sidebarHover
        : "rgba(255, 255, 255, 0.1)"};
  }
`;

// Theme toggle button
const AuthButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: fixed;
  top: 1rem;
  right: 2rem;
  z-index: 1002;

  @media (max-width: 768px) {
    display: none;
  }
`;

const ThemeToggle = styled.button`
  background: none;
  border: none;
  color: ${(props) => props.theme.colors.text};
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

// Overlay for mobile view when sidebar is open
const Overlay = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? "block" : "none")};
    position: fixed;
    top: 60px; // Start below header
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1001;
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    transition: opacity 0.3s ease;
  }
`;

const MobileAuthContainer = styled.div`
  display: none;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileThemeToggle = styled(ThemeToggle)`
  font-size: 1rem;
  padding: 0.25rem;
  color: white;
`;

const MobileHeader = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 1rem;
  background: ${(props) => props.theme.colors.background};
  backdrop-filter: blur(10px);
  z-index: 1001;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileLogo = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
    align-items: center;

    img {
      height: 24px;
      width: auto;
    }
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
  position: relative;
  padding: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  height: 42px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  outline: none;
  transition: all ${({ theme }) => theme.transitions.fast};

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textLight};
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
  background: ${(props) => props.theme.colors.sidebar};
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding: 1rem;
  color: ${(props) => props.theme.colors.text};

  @media (max-width: 768px) {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 1rem;
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
    padding-top: 80px; // Account for mobile header
  }
`;

// First, make sure there's only ONE ScrollIndicator styled component definition
const ScrollIndicator = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(
    to bottom,
    #fe3f68 -5.06%,
    #9b4bcc 30.57%,
    #4a6eec 74.68%,
    #2fdda2 105.9%
  );
  transform-origin: top;
  z-index: 1002;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user, handleLogin, handleLogout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [docStructure, setDocStructure] = useState({
    public: [],
    protected: [],
  });
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const loadDocStructure = async () => {
      const structure = await fetchDocStructure();
      setDocStructure(structure);
    };
    loadDocStructure();
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

  const handleNavClick = (e) => {
    if (e.target.closest(".search-container")) {
      e.stopPropagation();
      return;
    }
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
        <MobileAuthContainer>
          <MobileThemeToggle onClick={toggleTheme}>
            {isDark ? "🌞" : "🌙"}
          </MobileThemeToggle>
          {user ? (
            <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
          ) : (
            <AuthButton onClick={handleLogin}>Sign In</AuthButton>
          )}
        </MobileAuthContainer>
      </MobileHeader>

      <AuthButtonContainer>
        {user ? (
          <AuthButton onClick={handleLogout}>Sign Out</AuthButton>
        ) : (
          <AuthButton onClick={handleLogin}>Sign In</AuthButton>
        )}
        <ThemeToggle onClick={toggleTheme}>{isDark ? "🌞" : "🌙"}</ThemeToggle>
      </AuthButtonContainer>

      <Sidebar $isOpen={isMobileMenuOpen}>
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
              <SectionContainer key={section.id}>
                <SectionHeader>{section.title}</SectionHeader>
                <SectionItems>
                  {section.items.map((item) => (
                    <SectionItem key={item.id}>
                      <SectionLink
                        to={`/docs/${item.id}`}
                        $active={location.pathname === `/docs/${item.id}`}
                      >
                        {item.title}
                      </SectionLink>
                    </SectionItem>
                  ))}
                </SectionItems>
              </SectionContainer>
            ))}

            {user &&
              docStructure.protected.map((section) => (
                <SectionContainer key={section.id}>
                  <SectionHeader>
                    {section.title}
                    <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                      🔒
                    </span>
                  </SectionHeader>
                  <SectionItems>
                    {section.items.map((item) => (
                      <SectionItem key={item.id}>
                        <SectionLink
                          to={`/protected/docs/${item.id}`}
                          $active={
                            location.pathname === `/protected/docs/${item.id}`
                          }
                        >
                          {item.title}
                        </SectionLink>
                      </SectionItem>
                    ))}
                  </SectionItems>
                </SectionContainer>
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
};

export default Layout;
