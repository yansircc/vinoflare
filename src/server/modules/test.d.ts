declare module "cloudflare:test" {
  // env is the binding object that includes all the bindings
  export const env: Env;
  
  // Other exports that might be available
  export const SELF: Fetcher;
}