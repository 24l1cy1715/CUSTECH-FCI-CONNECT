import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';
import { listActivitySchema } from '../validators/activity.validator';

// ── Public: Get activity feed ─────────────────────────────────────────────────
export async function listActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listActivitySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const viewerUserId = req.user?.userId;
    const result = await ActivityService.getActivityFeed({
      ...parsed.data,
      viewerUserId,
    });

    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

// ── Public: Get single activity item ─────────────────────────────────────────
export async function getActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const viewerUserId = req.user?.userId;
    const item = await ActivityService.getActivityById(req.params.id as string, viewerUserId);

    if (!item) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Activity not found' } });
    }

    res.json({ success: true, data: item });
  } catch (e) {
    next(e);
  }
}
