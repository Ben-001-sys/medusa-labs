import { Container, Heading, Button } from "@medusajs/ui";
import LocalizedLink from "../../../lib/localized-link";

const B2BIndex = () => {
  return (
    <Container>
      <Heading level="h2">B2B</Heading>
      <div className="mt-4 flex gap-2">
        <Button asChild>
          <LocalizedLink href="/b2b/operations">Operations</LocalizedLink>
        </Button>
        <Button asChild>
          <LocalizedLink href="/b2b/organizations">Organizations</LocalizedLink>
        </Button>
      </div>
    </Container>
  );
};

export default B2BIndex;
