// Team functionality removed - contracts now work directly with users
export async function GET() {
  return Response.json({ message: 'Team functionality has been removed' }, { status: 410 });
}
