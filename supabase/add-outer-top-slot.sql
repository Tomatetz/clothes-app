alter table public.clothes
drop constraint if exists clothes_slots_check;

alter table public.clothes
add constraint clothes_slots_check check (
  slots <@ array['top', 'outerTop', 'bottom', 'shoes', 'bag']::text[]
  and cardinality(slots) > 0
);

alter table public.outfit_selections
drop constraint if exists outfit_selections_slot_check;

alter table public.outfit_selections
add constraint outfit_selections_slot_check check (
  slot in ('top', 'outerTop', 'bottom', 'shoes', 'bag')
);

update public.clothes
set slots = array_append(slots, 'outerTop'),
    updated_at = now()
where category in (
  'Coats',
  'Down Jackets',
  'Fur & Shearling',
  'Jackets',
  'Knitwear',
  'Shirts',
  'Sweatshirts'
)
and not slots @> array['outerTop']::text[];
