import bcrypt from "bcryptjs";
import { User } from "../../models/User";
import { Programme } from "../../models/Programme";
import { Track } from "../../models/Track";
import { Course } from "../../models/Course";
import { Role } from "../../config/roles";

export const TEST_PASSWORD = "Password123!";

export async function createUser(role: Role, overrides: Partial<{ email: string; name: string }> = {}) {
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 4); // low cost factor — speed, not security, in tests
  const user = await User.create({
    name: overrides.name ?? `Test ${role}`,
    email: overrides.email ?? `${role}.${Date.now()}.${Math.random().toString(36).slice(2)}@test.local`,
    passwordHash,
    role,
  });
  return user;
}

export async function createProgrammeTrackCourse(createdBy: string) {
  const programme = await Programme.create({
    name: "Test Programme",
    slug: `test-programme-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    createdBy,
  });
  const track = await Track.create({ programmeId: programme.id, name: "Test Track" });
  const contentAdmin = await createUser("content_admin");
  const course = await Course.create({
    title: "Test Course",
    trackId: track.id,
    contentAdminId: contentAdmin.id,
    status: "published",
  });
  return { programme, track, course, contentAdmin };
}
