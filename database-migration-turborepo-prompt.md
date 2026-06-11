State of the work: I built packages/database (@donbass-post/db) once already,
then cut it out of the project and parked the folder outside the repo as a
reference — it's preserved, not deleted. The bot currently still uses its own
src/prisma. I stopped over a Windows-only Cyrillic seed console error, which I
now understand is cosmetic (Linux/production unaffected) and orthogonal to the
restructure. I want to reintroduce the parked work incrementally — folder back
in → generate client → flip one import → then Dockerfile/workflow/turbo —
verifying between each step, rather than pasting it all back at once. The
preserved files I can share on request as we reach each step.
