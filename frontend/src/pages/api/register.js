export default function handler(_req, res) {
  res.status(410).json({ message: "Use backend /api/auth/register/* endpoints" });
}