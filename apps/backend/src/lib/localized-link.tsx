import React from "react";

type Props = {
  href: string;
  children?: React.ReactNode;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

const LocalizedLink = ({ href, children, ...rest }: Props) => {
  // Minimal implementation: render a normal anchor. In the admin app
  // localization is handled elsewhere; this keeps existing imports working.
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
};

export default LocalizedLink;
