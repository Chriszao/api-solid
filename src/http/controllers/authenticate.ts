import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { PrismaUsersRepository } from '~/repositories';
import { AuthenticateUseCase, InvalidCredentialsError } from '~/use-cases';

export async function authenticate(
	request: FastifyRequest,
	reply: FastifyReply,
): Promise<FastifyReply> {
	const authenticateBodySchema = z.object({
		email: z.string().email(),
		password: z.string().min(6),
	});

	const { email, password } = authenticateBodySchema.parse(request.body);

	try {
		const prismaUsersRepository = new PrismaUsersRepository();
		const authenticateUseCase = new AuthenticateUseCase(prismaUsersRepository);

		await authenticateUseCase.handle({
			email,
			password,
		});
	} catch (error) {
		if (error instanceof InvalidCredentialsError) {
			return reply.status(400).send({
				message: error.message,
			});
		}

		throw error;
	}

	return reply.status(200).send();
}
