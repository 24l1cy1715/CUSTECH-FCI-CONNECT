import { Request, Response, NextFunction } from 'express';
import { CampusService } from '../services/campus.service';
import { createLocationSchema, updateLocationSchema, listLocationsSchema } from '../validators/campus.validator';
import { CampusLocationCategory } from '@prisma/client';

// ── Public: List all active locations ─────────────────────────────────────────
export async function listLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listLocationsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const result = await CampusService.getLocations({
      ...parsed.data,
      adminView: false,
    });

    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

// ── Public: Get single location by slug ───────────────────────────────────────
export async function getLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const location = await CampusService.getLocationBySlug(req.params.slug as string);
    res.json({ success: true, data: location });
  } catch (e) {
    next(e);
  }
}

// ── Public: Get categories ────────────────────────────────────────────────────
export async function getCategories(_req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await CampusService.getCategories();
    res.json({ success: true, data: categories });
  } catch (e) {
    next(e);
  }
}

// ── Admin: List all locations (including inactive) ────────────────────────────
export async function adminListLocations(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = listLocationsSchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const result = await CampusService.getLocations({
      ...parsed.data,
      adminView: true,
    });

    res.json({ success: true, data: result });
  } catch (e) {
    next(e);
  }
}

// ── Admin: Create location ────────────────────────────────────────────────────
export async function adminCreateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createLocationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const location = await CampusService.createLocation({
      ...parsed.data,
      category: parsed.data.category as CampusLocationCategory,
    });

    res.status(201).json({ success: true, data: location });
  } catch (e) {
    next(e);
  }
}

// ── Admin: Update location ────────────────────────────────────────────────────
export async function adminUpdateLocation(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = updateLocationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(422).json({ success: false, error: parsed.error.flatten().fieldErrors });
    }

    const location = await CampusService.updateLocation(req.params.id as string, parsed.data);
    res.json({ success: true, data: location });
  } catch (e) {
    next(e);
  }
}

// ── Admin: Deactivate (soft delete) location ──────────────────────────────────
export async function adminDeleteLocation(req: Request, res: Response, next: NextFunction) {
  try {
    await CampusService.deleteLocation(req.params.id as string);
    res.json({ success: true, message: 'Location deactivated successfully' });
  } catch (e) {
    next(e);
  }
}
