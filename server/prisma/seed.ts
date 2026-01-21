
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const adminUsername = 'admin';
    const adminPassword = 'Zeanokai@1';
    const adminEmail = 'admin@quizian.com';
    const adminFullName = 'System Admin';

    const existingAdmin = await prisma.user.findFirst({
        where: {
            OR: [
                { username: adminUsername },
                { role: 'ADMIN' }
            ]
        }
    });

    if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                username: adminUsername,
                email: adminEmail,
                fullName: adminFullName,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log('Admin user created successfully.');
    } else {
        console.log('Admin user already exists.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
