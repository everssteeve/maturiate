import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface CampaignInvitationEmailProps {
  campaignName: string;
  teamName: string;
  diagnosticUrl: string;
  endDate?: string;
}

export function CampaignInvitationEmail({
  campaignName,
  teamName,
  diagnosticUrl,
  endDate,
}: CampaignInvitationEmailProps) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>maturIAté</Text>
          </Section>

          <Text style={heading}>Campagne : {campaignName}</Text>

          <Text style={paragraph}>
            Votre équipe <strong>{teamName}</strong> est invitée à remplir son diagnostic de
            maturité IA dans le cadre de la campagne <strong>{campaignName}</strong>.
          </Text>

          {endDate && (
            <Text style={paragraph}>
              À compléter avant le <strong>{endDate}</strong>.
            </Text>
          )}

          <Section style={buttonSection}>
            <Button href={diagnosticUrl} style={button}>
              Remplir le diagnostic
            </Button>
          </Section>

          <Text style={note}>
            Ce diagnostic prend environ 10 minutes. Il évalue la maturité IA de votre équipe sur
            6 dimensions.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            maturIAté — Évaluez et suivez la maturité IA de vos équipes de développement.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const body = {
  backgroundColor: "#f4f4f5",
  fontFamily: "DM Sans, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "32px",
  borderRadius: "12px",
  maxWidth: "480px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoText = {
  fontSize: "24px",
  fontWeight: "700",
  color: "#0f172a",
  margin: "0",
};

const heading = {
  fontSize: "20px",
  fontWeight: "600",
  color: "#0f172a",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "15px",
  color: "#475569",
  lineHeight: "1.6",
  marginBottom: "24px",
};

const buttonSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const button = {
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  borderRadius: "8px",
  padding: "12px 32px",
};

const note = {
  fontSize: "13px",
  color: "#94a3b8",
  textAlign: "center" as const,
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "24px 0",
};

const footer = {
  fontSize: "12px",
  color: "#94a3b8",
  textAlign: "center" as const,
};
