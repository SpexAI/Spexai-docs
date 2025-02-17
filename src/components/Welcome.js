import styled from "styled-components";
import ParticleBackground from "./ParticleBackground";

const WelcomeContainer = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(
    97.38deg,
    #fe3f68 -5.06%,
    #9b4bcc 30.57%,
    #4a6eec 74.68%,
    #2fdda2 105.9%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Section = styled.div`
  margin-bottom: 2rem;
  background: ${({ theme }) =>
    theme.mode === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 0, 0, 0.6)"};
  padding: 1.5rem;
  border-radius: ${(props) => props.theme.borderRadius.lg};
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  margin-bottom: 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
`;

const Welcome = () => {
  return (
    <>
      <ParticleBackground />
      <WelcomeContainer>
        {/* <Title>Welcome to SpexAI Documentation</Title>

        <Section>
          <SectionTitle>Getting Started</SectionTitle>
          <p>
            Welcome to the SpexAI documentation portal. Here you'll find
            comprehensive guides and documentation to help you start working
            with SpexAI as quickly as possible.
          </p>
        </Section>

        <Section>
          <SectionTitle>What's Included</SectionTitle>
          <ul>
            <li>Detailed hardware documentation for Hugin cameras</li>
            <li>Software guides for the Odin platform</li>
            <li>Research papers and case studies</li>
            <li>Installation and setup guides</li>
            <li>API documentation and examples</li>
          </ul>
        </Section>

        <Section>
          <SectionTitle>Need Help?</SectionTitle>
          <p>
            Can't find what you're looking for? Need help with implementation?
            Contact our support team at{" "}
            <a href="mailto:support@spexai.com">support@spexai.com</a>
          </p>
        </Section> */}
      </WelcomeContainer>
    </>
  );
};

export default Welcome;
