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

export function MagicLinkEmail({ url }: { url: string }) {
  return (
    <Html lang="fr">
      <Head />
      <Body style={body}>
        <Container style={container}>
          <Section style={logoSection}>
            <Text style={logoText}>maturIAté</Text>
          </Section>

          <Text style={heading}>Connexion à maturIAté</Text>

          <Text style={paragraph}>
            Cliquez sur le bouton ci-dessous pour vous connecter à votre compte maturIAté.
          </Text>

          <Section style={buttonSection}>
            <Button href={url} style={button}>
              Se connecter
            </Button>
          </Section>

          <Text style={note}>
            Ce lien expire dans 10 minutes et ne peut être utilisé qu&apos;une seule fois.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            Si vous n&apos;avez pas demandé ce lien, vous pouvez ignorer cet email en toute
            sécurité.
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
