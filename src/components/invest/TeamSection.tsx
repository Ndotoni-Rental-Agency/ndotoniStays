import { Linkedin, Mail } from 'lucide-react';
import { TEAM } from './investData';

export function TeamSection() {
  return (
    <section className="overflow-hidden bg-white px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold">Team</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-ink-500">
          A lean, hungry team building from Dar es Salaam and Seattle.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-ink-100 bg-ink-50 p-6 shadow-sm"
            >
              {/* Avatar */}
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.gradient}`}
              >
                <span className="text-lg font-bold text-white">{member.initials}</span>
              </div>

              <h3 className="mt-4 text-center text-lg font-semibold">{member.name}</h3>
              <p className="text-center text-sm font-medium text-brand-600">{member.role}</p>
              <p className="mt-3 text-center text-sm text-ink-500">{member.bio}</p>

              {member.company && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Work:</p>
                  <p className="mt-0.5 text-sm text-ink-700">{member.company}</p>
                </div>
              )}

              {member.education && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">Edu:</p>
                  <p className="mt-0.5 text-sm text-ink-700">{member.education}</p>
                </div>
              )}

              {/* Links */}
              {(member.linkedin || member.email) && (
                <div className="mt-4 flex items-center justify-center gap-3 border-t border-ink-100 pt-4">
                  {member.linkedin && (
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Linkedin className="h-4 w-4" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-ink-500 transition hover:bg-brand-50 hover:text-brand-600"
                    >
                      <Mail className="h-4 w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
