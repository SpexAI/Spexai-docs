import styled from "styled-components";
import ParticleBackground from "./ParticleBackground";

const WelcomeLayout = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 45% 55%;
  min-height: 100vh;
  isolation: isolate;
  overflow: hidden;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto;
  }
`;

const ContentSection = styled.div`
  padding: 4rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    padding: 2rem;
    text-align: center;
    padding-top: 80px; // Account for mobile header
  }
`;

const ParticleSection = styled.div`
  position: absolute;
  top: 0;
  right: -5%;
  width: 100%;
  height: 100%;

  @media (max-width: 768px) {
    position: relative;
    right: 0;
    width: 100%;
    height: 100vh;
    order: -1;
    margin: 0;
    padding: 0;
  }
`;

const StyledTitle = styled.div`
  font-size: 4.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  background: linear-gradient(
    97.38deg,
    #fe3f68 -5.06%,
    #9b4bcc 30.57%,
    #4a6eec 74.68%,
    #2fdda2 105.9%
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  mix-blend-mode: normal;
  position: relative;

  @media (max-width: 768px) {
    font-size: 3rem;
  }

  @media (max-width: 480px) {
    font-size: 2.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.4rem;
  color: ${(props) => props.theme.colors.text};
  margin-bottom: 2rem;
  line-height: 1.6;
  opacity: 0.9;

  @media (max-width: 768px) {
    font-size: 1.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Welcome = () => {
  return (
    <WelcomeLayout>
      <ContentSection>
        <StyledTitle>The Docs</StyledTitle>
        <Subtitle>
          SpexAI empowers industries with advanced AI-driven visual
          intelligence, transforming how machines perceive and understand the
          world.
        </Subtitle>
      </ContentSection>
      <ParticleSection>
        <ParticleBackground />
      </ParticleSection>
    </WelcomeLayout>
  );
};

export default Welcome;
