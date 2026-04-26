/// <reference types="vite/client" />

declare module "*.jpg";
declare module "*.png";
declare module "*.jpeg";
declare module "*.svg";

// This is enough to declare `.avif` files as string
declare module "*.avif" {
  const value: string;
  export default value;
}
