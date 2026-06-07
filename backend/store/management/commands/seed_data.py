"""
Management command to seed the database with sample categories and products.
Run: python manage.py seed_data
"""
from django.core.management.base import BaseCommand
from store.models import Category, Product
from django.utils.text import slugify


SEED_DATA = [
    {
        "name": "Music Streaming",
        "slug": "music-streaming",
        "icon": "🎵",
        "description": "Music and podcast streaming services",
        "products": [
            {
                "name": "Spotify Premium",
                "description": "Ad-free music, offline downloads, high-quality audio. Access 80 million+ songs and podcasts.",
                "features": ["Ad-free listening", "Offline downloads", "320kbps audio quality", "Unlimited skips", "Group Sessions"],
                "price": "119.00",
                "billing_cycle": "monthly",
                "is_featured": True,
            },
            {
                "name": "Spotify Student",
                "description": "All Spotify Premium features at half price for students.",
                "features": ["All Premium features", "50% discount", "Verified student accounts"],
                "price": "59.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
            {
                "name": "Apple Music Individual",
                "description": "Stream 100 million songs, spatial audio, and lossless audio.",
                "features": ["100M+ songs", "Spatial Audio", "Lossless quality", "Live radio", "iCloud Music Library"],
                "price": "99.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
        ],
    },
    {
        "name": "Video Streaming",
        "slug": "video-streaming",
        "icon": "🎬",
        "description": "Movies, shows, and live TV streaming",
        "products": [
            {
                "name": "Netflix Standard",
                "description": "Watch on 2 devices simultaneously, Full HD quality, downloadable content.",
                "features": ["Full HD 1080p", "2 screens simultaneously", "Downloads on 2 devices", "No ads", "All Netflix Originals"],
                "price": "649.00",
                "billing_cycle": "monthly",
                "is_featured": True,
            },
            {
                "name": "Netflix Premium",
                "description": "Ultra HD 4K, 4 screens, spatial audio — the best Netflix experience.",
                "features": ["4K Ultra HD", "4 screens simultaneously", "Spatial audio", "Downloads on 6 devices", "Netflix Games"],
                "price": "799.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
            {
                "name": "Prime Video Annual",
                "description": "Amazon Prime Video + Prime benefits all year at a discounted rate.",
                "features": ["Prime Video", "Prime Delivery", "Prime Music", "Prime Reading", "200+ channels"],
                "price": "1499.00",
                "billing_cycle": "yearly",
                "is_featured": True,
            },
            {
                "name": "Disney+ Hotstar Premium",
                "description": "Disney, Marvel, Star Wars, National Geographic, and live sports.",
                "features": ["4K streaming", "Marvel & Star Wars", "Live sports (IPL)", "Disney classics", "4 screens"],
                "price": "299.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
        ],
    },
    {
        "name": "Productivity",
        "slug": "productivity",
        "icon": "💼",
        "description": "Tools to boost your work and creativity",
        "products": [
            {
                "name": "Microsoft 365 Personal",
                "description": "Word, Excel, PowerPoint, Outlook, and 1 TB OneDrive storage.",
                "features": ["Word, Excel, PowerPoint", "1TB OneDrive", "Outlook premium", "Advanced security", "1 device"],
                "price": "4999.00",
                "billing_cycle": "yearly",
                "is_featured": True,
            },
            {
                "name": "Notion Plus",
                "description": "Unlimited blocks, version history, and collaboration for individuals.",
                "features": ["Unlimited blocks", "30-day history", "Unlimited file uploads", "Priority support", "API access"],
                "price": "1600.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
        ],
    },
    {
        "name": "Learning",
        "slug": "learning",
        "icon": "📚",
        "description": "Online education and skill development",
        "products": [
            {
                "name": "Coursera Plus Annual",
                "description": "7,000+ courses, specializations, and professional certificates.",
                "features": ["7000+ courses", "Certificates included", "Learn at your own pace", "Hands-on projects", "Graded assignments"],
                "price": "35999.00",
                "billing_cycle": "yearly",
                "is_featured": True,
            },
            {
                "name": "LinkedIn Learning",
                "description": "In-demand skills from industry experts. LinkedIn profile certificate.",
                "features": ["16,000+ courses", "LinkedIn certificates", "Offline viewing", "Personalized recommendations", "Expert instructors"],
                "price": "1299.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
        ],
    },
    {
        "name": "Cloud Storage",
        "slug": "cloud-storage",
        "icon": "☁️",
        "description": "Secure file storage and sync services",
        "products": [
            {
                "name": "Google One 100GB",
                "description": "Extra Google storage shared across Gmail, Drive, and Photos.",
                "features": ["100GB storage", "Shared with family (up to 5)", "Google expert support", "Google Photos editing", "VPN included"],
                "price": "130.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
            {
                "name": "Dropbox Plus",
                "description": "2TB cloud storage with advanced sharing and collaboration features.",
                "features": ["2TB storage", "180-day version history", "Smart Sync", "Transfer up to 100GB", "Priority support"],
                "price": "1500.00",
                "billing_cycle": "monthly",
                "is_featured": True,
            },
        ],
    },
    {
        "name": "Gaming",
        "slug": "gaming",
        "icon": "🎮",
        "description": "Gaming subscriptions and passes",
        "products": [
            {
                "name": "Xbox Game Pass Ultimate",
                "description": "100+ high-quality games on console, PC, and cloud. Day-one releases.",
                "features": ["100+ games", "Day-one titles", "Cloud gaming", "EA Play included", "Xbox Live Gold"],
                "price": "699.00",
                "billing_cycle": "monthly",
                "is_featured": True,
            },
            {
                "name": "PlayStation Plus Essential",
                "description": "Online multiplayer, monthly games, and exclusive discounts.",
                "features": ["Online multiplayer", "2-3 free monthly games", "Exclusive discounts", "Cloud storage 100GB", "Share Play"],
                "price": "499.00",
                "billing_cycle": "monthly",
                "is_featured": False,
            },
        ],
    },
]


class Command(BaseCommand):
    help = 'Seed database with sample categories and subscription products'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...\n')
        total_cats = 0
        total_prods = 0

        for cat_data in SEED_DATA:
            products = cat_data.pop('products')
            cat, created = Category.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data,
            )
            if created:
                total_cats += 1
                self.stdout.write(f'  Category created: {cat.name}')

            for prod_data in products:
                slug = slugify(prod_data['name'])
                _, prod_created = Product.objects.get_or_create(
                    slug=slug,
                    defaults={**prod_data, 'category': cat},
                )
                if prod_created:
                    total_prods += 1
                    self.stdout.write(f'    + {prod_data["name"]}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nDone! Created {total_cats} categories and {total_prods} products.'
            )
        )
