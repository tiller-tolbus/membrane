|%
+$  sheet  $:(meta=sheet-meta data=(map address scell))
+$  sheet-meta  $:
  id=@uw
  =path
  title=@t
  owner=@p
  tags=(set tag)
  row-meta=(map @ud (set visual))
  column-meta=(map @ud (set visual))
  row-count=@ud
  column-count=@ud
  =whitelist
  last-modified=@da
  ==
+$  address  [row-address=@ud column-address=@ud]
+$  tag  @t
+$  scell  [meta=scell-meta data=scell-data]
+$  scell-meta  (set visual)
+$  scell-data  [input=@t output=@t]
+$  visual  $%
  [%bold ?]
  [%italic ?]
  [%underline ?]
  [%monospace ?]
  [%strikethrough ?]
  [%foreground tape]
  [%background tape]
  [%size @ud]
  [%font tape]
  [%height @ud]
  [%width @ud]
  ==
+$  whitelist  (map @p access)
+$  access  ?(%read %write)
--