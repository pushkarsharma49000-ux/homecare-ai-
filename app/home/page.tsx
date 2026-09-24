'use client';

import Link from 'next/link';
import { AirVent, ChefHat, Utensils, Refrigerator, Tv, WashingMachine, ArrowUpRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

const appliances = [
  { name: 'Washing Machine', type: 'washing_machine', detail: 'Wash, spin, drainage & vibration issues', icon: WashingMachine },
  { name: 'Refrigerator', type: 'refrigerator', detail: 'Cooling, freezing & temperature issues', icon: Refrigerator },
  { name: 'Air Conditioner', type: 'air_conditioner', detail: 'Cooling, airflow & performance issues', icon: AirVent },
  { name: 'Television', type: 'television', detail: 'Display, sound & connectivity issues', icon: Tv },
  { name: 'Microwave', type: 'microwave', detail: 'Heating, power & control issues', icon: ChefHat },
  { name: 'Dishwasher', type: 'dishwasher', detail: 'Cleaning, drainage & cycle issues', icon: Utensils },
];

export default function CustomerHomePage() {
  return <div className="mx-auto max-w-6xl space-y-12 py-3"><section className="max-w-2xl"><p className="text-xs font-semibold tracking-[.22em] text-[#9a7440]">HOMECARE AI</p><h1 className="mt-4 text-4xl font-semibold tracking-tight text-[#28241f] sm:text-5xl">How can we help today?</h1><p className="mt-4 text-lg text-[#756d62]">Select an appliance to start AI-assisted troubleshooting or book service.</p></section><section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{appliances.map(({ name, type, detail, icon: Icon }) => <Link key={type} href={`/ai-support?appliance=${type}`} className="group rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#a67c45]"><Card className="h-full border-[#e3d9ca] bg-[#fffdf9] shadow-[0_8px_30px_rgba(58,45,29,.06)] transition duration-300 group-hover:-translate-y-1 group-hover:border-[#cbb48e] group-hover:shadow-[0_18px_38px_rgba(58,45,29,.12)]"><CardContent className="p-6"><div className="flex items-start justify-between"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f2e9dc] text-[#8b693b]"><Icon className="h-6 w-6" /></div><ArrowUpRight className="h-5 w-5 text-[#a99b89] transition group-hover:text-[#8b693b]" /></div><h2 className="mt-7 text-xl font-semibold text-[#2d2923]">{name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-[#756d62]">{detail}</p><p className="mt-6 text-sm font-semibold text-[#8b693b]">Get Support</p></CardContent></Card></Link>)}</section><section className="rounded-3xl border border-[#e2d6c4] bg-[#eee7da] p-6 sm:p-8"><p className="text-xs font-semibold tracking-[.18em] text-[#927042]">YOUR SERVICE AT A GLANCE</p><div className="mt-5 grid gap-4 sm:grid-cols-3"><Link href="/my-service-requests" className="rounded-2xl p-2 transition hover:bg-[#f7f1e7]"><p className="text-sm text-[#766d61]">Active requests</p><p className="mt-1 text-lg font-semibold text-[#312c25]">View My Requests →</p></Link><Link href="/my-service-requests" className="rounded-2xl p-2 transition hover:bg-[#f7f1e7]"><p className="text-sm text-[#766d61]">Upcoming appointment</p><p className="mt-1 text-lg font-semibold text-[#312c25]">See scheduled service →</p></Link><Link href="/my-appliances" className="rounded-2xl p-2 transition hover:bg-[#f7f1e7]"><p className="text-sm text-[#766d61]">Need to add an appliance?</p><p className="mt-1 text-lg font-semibold text-[#8b693b]">Manage appliances →</p></Link></div></section></div>;
}
