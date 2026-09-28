import { redirect } from 'next/navigation';

// The flow moved to its own full page.
export default function ManagedStayNewRedirect() {
  redirect('/managed/new');
}
