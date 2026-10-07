import { redirect } from 'next/navigation';

/** "All stays" lives on the Managed listings page now. */
export default function AllStaysRedirect() {
  redirect('/host/managed?view=all');
}
