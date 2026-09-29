import { Router } from 'express';
import { githubController } from '../controllers/github.controller';
import { authenticate, optionalAuthenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { connectGithubSchema, updateGithubPrivacySchema } from '../validators/github.validator';

export const githubRouter = Router();

githubRouter.post('/connect', authenticate, validate(connectGithubSchema), githubController.connectGithub);
githubRouter.get('/:usernameOrUserId', optionalAuthenticate, githubController.getGithubProfile);
githubRouter.patch('/privacy', authenticate, validate(updateGithubPrivacySchema), githubController.updatePrivacy);
githubRouter.delete('/disconnect', authenticate, githubController.disconnectGithub);

export default githubRouter;
