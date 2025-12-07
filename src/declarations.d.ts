// src/declarations.d.ts

// Permite a importação de módulos com a extensão .jsx (como o App.jsx)
declare module "*.jsx" {
  const content: any;
  export default content;
}