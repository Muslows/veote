import type { ElementType, ReactNode } from "react";

export type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
};

/**
 * Conteneur largeur max shell + padding horizontal.
 */
export function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag
      className={["mx-auto w-full max-w-shell px-4 sm:px-6", className].join(
        " ",
      )}
    >
      {children}
    </Tag>
  );
}
