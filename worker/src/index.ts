/**
 * crossed OG-image Worker - stub.
 * Image generation is not yet implemented.
 * This handler returns a plain placeholder response so the Worker
 * can be deployed and routed without errors.
 */
export default {
  async fetch(_request: Request): Promise<Response> {
    return new Response(
      'OG image Worker not yet implemented.',
      {
        status: 501,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      }
    );
  }
} satisfies ExportedHandler;
