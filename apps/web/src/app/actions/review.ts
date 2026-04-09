'use server';

import { prisma } from '@srmall/database';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function submitReviewAction(userId: string, rating: number, comment?: string) {
  try {
    if (!userId) {
      return {
        success: false,
        error: 'You must be logged in to submit a review'
      };
    }

    if (rating < 1 || rating > 5) {
      return {
        success: false,
        error: 'Rating must be between 1 and 5 stars'
      };
    }

    // Check if user already submitted a review
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: userId
      }
    });

    if (existingReview) {
      return {
        success: false,
        error: 'You have already submitted a review. You can edit your existing review instead.'
      };
    }

    const review = await prisma.review.create({
      data: {
        userId: userId,
        rating,
        comment: comment || null,
        isApproved: false // Requires admin approval before appearing on public view
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    // Create notification for admin about new review
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'NEW_REVIEW_SUBMITTED',
        title: 'New Review Submitted',
        message: `A new ${rating}-star review is pending moderation approval.`
      }
    });

    revalidatePath('/public-view');
    revalidatePath('/admindashboard');

    return {
      success: true,
      data: review,
      message: 'Review submitted! It will appear publicly once approved by our team.'
    };

  } catch (error) {
    console.error('Submit review error:', error);
    return {
      success: false,
      error: 'Failed to submit review. Please try again.'
    };
  }
}

export async function editMyReviewAction(userId: string, rating: number, comment?: string) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };
    if (rating < 1 || rating > 5) return { success: false, error: 'Invalid rating' };

    const existingReview = await prisma.review.findFirst({ where: { userId } });
    if (!existingReview) return { success: false, error: 'Review not found.' };

    const review = await prisma.review.update({
      where: { id: existingReview.id },
      data: { rating, comment: comment || null }
    });
    
    revalidatePath('/public-view');
    revalidatePath('/admindashboard');
    return { success: true, data: review, message: 'Review updated successfully!' };
  } catch (error) {
    console.error('Edit review error:', error);
    return { success: false, error: 'Failed to update review.' };
  }
}

export async function deleteMyReviewAction(userId: string) {
  try {
    if (!userId) return { success: false, error: 'Unauthorized' };
    
    const existingReview = await prisma.review.findFirst({ where: { userId } });
    if (!existingReview) return { success: false, error: 'Review not found.' };

    await prisma.review.delete({
      where: { id: existingReview.id }
    });
    
    revalidatePath('/public-view');
    revalidatePath('/admindashboard');
    return { success: true, message: 'Review deleted successfully!' };
  } catch (error) {
    console.error('Delete review error:', error);
    return { success: false, error: 'Failed to delete review.' };
  }
}

export async function getMyReviewAction(userId: string) {
  try {
    const review = await prisma.review.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    return { success: true, data: review };
  } catch (error) {
    console.error('Get my review error:', error);
    return { success: false, error: 'Failed to fetch your review.' };
  }
}

export async function getApprovedReviewsAction() {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        isApproved: true
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit to latest 50 reviews
    });

    return {
      success: true,
      data: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        user: {
          name: review.user.name || 'Anonymous',
          email: review.user.email
        }
      }))
    };

  } catch (error) {
    console.error('Get reviews error:', error);
    return {
      success: false,
      error: 'Failed to load reviews'
    };
  }
}

export async function getAllReviewsAction() {
  try {
    // Get user from cookie storage (custom auth system)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('srmall_user')?.value;
    
    if (!userCookie) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    let user;
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid authentication data'
      };
    }

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return {
      success: true,
      data: reviews
    };

  } catch (error) {
    console.error('Get all reviews error:', error);
    return {
      success: false,
      error: 'Failed to load reviews'
    };
  }
}

export async function approveReviewAction(reviewId: string) {
  try {
    // Get user from cookie storage (custom auth system)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('srmall_user')?.value;
    
    if (!userCookie) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    let user;
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid authentication data'
      };
    }

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    revalidatePath('/public-view');
    revalidatePath('/admindashboard');

    return {
      success: true,
      data: review,
      message: 'Review approved successfully'
    };

  } catch (error) {
    console.error('Approve review error:', error);
    return {
      success: false,
      error: 'Failed to approve review'
    };
  }
}

export async function deleteReviewAction(reviewId: string) {
  try {
    // Get user from cookie storage (custom auth system)
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('srmall_user')?.value;
    
    if (!userCookie) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    let user;
    try {
      user = JSON.parse(userCookie);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid authentication data'
      };
    }

    // Check if user is admin
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (userData?.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Admin access required'
      };
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    revalidatePath('/public-view');
    revalidatePath('/admindashboard');

    return {
      success: true,
      message: 'Review deleted successfully'
    };

  } catch (error) {
    console.error('Delete review error:', error);
    return {
      success: false,
      error: 'Failed to delete review'
    };
  }
}
